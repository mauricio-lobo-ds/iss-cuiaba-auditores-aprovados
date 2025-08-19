import React from 'react';
import { RefreshCw, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CallOrderPosition } from './CallOrderPosition';
import { RemovedCandidates } from './RemovedCandidates';
import { useCandidates } from '../../hooks/useCandidates';
import { useCallOrder } from '../../hooks/useCallOrder';
import { useExport } from '../../hooks/useExport';
import { Specialty } from '../../types';

interface CallOrderListProps {
  specialty: Specialty;
}

export const CallOrderList: React.FC<CallOrderListProps> = ({ specialty }) => {
  const { candidates, loading: candidatesLoading, error: candidatesError } = useCandidates(specialty);
  const {
    callOrderState,
    error: callOrderError,
    resetCallOrder,
    removeCandidate,
    updatePositionType,
    restoreCandidate
  } = useCallOrder(specialty, candidates);
  const { exportToExcel, exportToPDF, loading: exportLoading } = useExport();

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja resetar a ordem de chamada? Esta ação não pode ser desfeita.')) {
      await resetCallOrder();
    }
  };

  const handleExportExcel = async () => {
    await exportToExcel(specialty, candidates, callOrderState.positions);
  };

  const handleExportPDF = async () => {
    await exportToPDF(specialty, 'call-order-table');
  };

  if (candidatesLoading || callOrderState.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600">
          {candidatesLoading ? 'Carregando candidatos...' : 'Calculando ordem de chamada...'}
        </span>
      </div>
    );
  }

  if (candidatesError || callOrderError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{candidatesError || callOrderError}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ordem de Chamada</h2>
          <p className="text-slate-600">
            Primeiros 20 candidatos na ordem de chamada para {specialty}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={handleReset}
            className="text-slate-600"
          >
            Resetar
          </Button>
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            loading={exportLoading}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportPDF}
            loading={exportLoading}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Removed Candidates */}
      {callOrderState.removedCandidates.length > 0 && (
        <RemovedCandidates
          removedCandidates={callOrderState.removedCandidates}
          specialty={specialty}
          onRestore={restoreCandidate}
        />
      )}

      {/* Call Order Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-slate-900">
            Posições de Chamada
          </h3>
        </CardHeader>
        <CardContent>
          <div id="call-order-table" className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-20 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="w-20 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="w-28 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Inscrição
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="w-16 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="w-28 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {callOrderState.positions.map((position, index) => (
                  <CallOrderPosition
                    key={position.position}
                    position={position}
                    index={index}
                    specialty={specialty}
                    onRemove={removeCandidate}
                    onUpdateType={(pos, type) => updatePositionType(pos, type)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent>
          <h4 className="font-medium text-slate-900 mb-3">Legenda:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-slate-600">AC - Ampla Concorrência</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-slate-600">PCD - Pessoa com Deficiência</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-slate-600">NI - Negros e Indígenas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};