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

      // Candidates sheet
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

      // Call order sheet if provided
      if (callOrder) {
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
    elementId: string
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found for PDF export');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
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