import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidate, CallPosition, Specialty } from '../types';
import { format } from 'date-fns';

export class ExportService {
  async exportToExcel(
    specialty: Specialty,
    candidates: Candidate[],
    callOrder?: CallPosition[]
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // Candidates sheet (only if there are candidates to export)
      if (candidates && candidates.length > 0) {
        const candidatesData = candidates.map(candidate => ({
          'Inscrição': candidate.inscricao,
          'Nome': candidate.nome,
          'Data de Nascimento': candidate.nascimento,
          'Nota': candidate.nota,
          'Classificação AC': candidate.ac,
          'Classificação PCD': candidate.pcd || '',
          'Classificação NI': candidate.ni || '',
          'Status': candidate.removed ? 'Removido' : 'Ativo'
        }));

        const candidatesSheet = XLSX.utils.json_to_sheet(candidatesData);
        XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Candidatos');
      }

      // Call order sheet if provided
      if (callOrder && callOrder.length > 0) {
        const callOrderData = callOrder.map(position => ({
          'Posição': position.position,
          'Tipo': position.type,
          'Inscrição': position.candidate?.inscricao || '',
          'Nome': position.candidate?.nome || '',
          'Nota': position.candidate?.nota || ''
        }));

        const callOrderSheet = XLSX.utils.json_to_sheet(callOrderData);
        XLSX.utils.book_append_sheet(workbook, callOrderSheet, 'Ordem de Chamada');
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `${specialty.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  async exportToPDF(
    specialty: Specialty,
    elementId: string,
    options?: { title?: string; subtitle?: string; removedCandidates?: Candidate[] }
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found for PDF export');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (el: Element) => {
          try {
            return (el as HTMLElement).classList?.contains('export-hide-pdf') || false;
          } catch {
            return false;
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Margens e cabeçalho
      const margin = 12; // mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const appTitle = 'Aprovados - Auditor Fiscal Tributário - Cuiabá';
      const editalText = 'Concurso Edital nº 01/2024';
      const editalUrl = (import.meta as any).env?.VITE_EDITAL_URL as string | undefined;
      const specialtyLabel = `Especialidade: ${String(specialty)}`;
      const timestampText = `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

      const drawHeader = () => {
        let yCursor = margin + 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(appTitle, margin, yCursor);
        yCursor += 7;

        if (options?.title) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.text(String(options.title), margin, yCursor);
          yCursor += 6;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const fullEdital = editalUrl ? `${editalText} (${editalUrl})` : editalText;
        pdf.text(fullEdital, margin, yCursor);
        yCursor += 6;

        if (options?.subtitle) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text(String(options.subtitle), margin, yCursor);
          yCursor += 5;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(specialtyLabel, margin, yCursor);
        yCursor += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(timestampText, margin, yCursor);
        yCursor += 6;

        return yCursor; // retorna a linha onde começa o conteúdo
      };

      // Primeira página (tabela principal)
      const contentStartY = drawHeader();
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', margin, contentStartY, contentWidth, imgHeight);
      heightLeft -= (pageHeight - contentStartY - margin);

      // Demais páginas
      while (heightLeft > 0) {
        pdf.addPage();
        const nextContentStartY = drawHeader();
        const usableHeight = pageHeight - nextContentStartY - margin;
        const shift = imgHeight - heightLeft;
        const position = nextContentStartY - shift;
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      // Se houver removidos, renderiza uma seção após a tabela
      if (options?.removedCandidates && options.removedCandidates.length > 0) {
        pdf.addPage();
        let y = drawHeader();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Candidatos que não assumem', margin, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        options.removedCandidates.forEach((c, idx) => {
          const line = `${idx + 1}. ${c.inscricao} - ${c.nome} | Nota: ${c.nota} | AC: ${c.ac}${c.pcd ? ` | PCD: ${c.pcd}` : ''}${c.ni ? ` | NI: ${c.ni}` : ''}`;
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = drawHeader();
          }
          pdf.text(line, margin, y);
          y += 5;
        });
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `${specialty.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export to PDF');
    }
  }
}