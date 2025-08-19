import React, { useState } from 'react';
import { X, Edit3, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { CallPosition, Specialty } from '../../types';

interface CallOrderPositionProps {
  position: CallPosition;
  index: number;
  specialty: Specialty;
  onRemove: (candidateId: string) => Promise<void>;
  onUpdateType: (position: number, newType: 'AC' | 'PCD' | 'NI') => Promise<void>;
}

export const CallOrderPosition: React.FC<CallOrderPositionProps> = ({
  position,
  index,
  specialty,
  onRemove,
  onUpdateType
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(position.type);

  const isEven = index % 2 === 0;

  const handleRemoveCandidate = async () => {
    if (!position.candidate) return;
    
    if (window.confirm(`Tem certeza que deseja marcar ${position.candidate.nome} como "não assume"?`)) {
      await onRemove(position.candidate.inscricao);
    }
  };

  const handleUpdateType = async () => {
    await onUpdateType(position.position, editingType);
    setIsEditing(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AC': return 'info';
      case 'PCD': return 'warning';
      case 'NI': return 'success';
      default: return 'default';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'AC': return 'bg-blue-50';
      case 'PCD': return 'bg-yellow-50';
      case 'NI': return 'bg-green-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <tr className={`group ${isEven ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg font-bold text-slate-900 mr-2">
            {position.position}º
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Select
              value={editingType}
              onChange={(e) => setEditingType(e.target.value as 'AC' | 'PCD' | 'NI')}
              options={[
                { value: 'AC', label: 'AC' },
                { value: 'PCD', label: 'PCD' },
                { value: 'NI', label: 'NI' }
              ]}
              className="w-20"
            />
            <Button
              variant="success"
              size="sm"
              icon={Check}
              onClick={handleUpdateType}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditingType(position.type);
              }}
            >
              ✕
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant={getTypeColor(position.type)} className={getTypeBgColor(position.type)}>
              {position.type}
            </Badge>
            {position.editable && (
              <Button
                variant="ghost"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
        {position.candidate?.inscricao || (
          <span className="text-slate-400 italic">Vago</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
        {position.candidate?.nome || (
          <div className="flex items-center text-slate-400 italic">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Nenhum candidato disponível
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
        {position.candidate?.nota || (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
        {position.candidate && (
          <Button
            variant="error"
            size="sm"
            icon={X}
            onClick={handleRemoveCandidate}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Não assume
          </Button>
        )}
      </td>
    </tr>
  );
};