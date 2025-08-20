import React from 'react';
import { Calendar, GraduationCap, Briefcase, Award, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Specialty } from '../../types';
import { useCallOrder } from '../../hooks/useCallOrder';
import { useCandidates } from '../../hooks/useCandidates';
import { useApprovedProfiles } from '../../hooks/useApprovedProfiles';

interface CandidateProfilesProps {
  specialty: Specialty;
}

export const CandidateProfiles: React.FC<CandidateProfilesProps> = ({ specialty }) => {
  const { candidates, loading: candidatesLoading } = useCandidates(specialty);
  const { callOrderState } = useCallOrder(specialty, candidates);
  const { getProfile, formatFormacao, formatExperiencia, formatAprovacoes, loading: profilesLoading } = useApprovedProfiles();

  const calledCandidates = callOrderState.positions
    .filter(pos => pos.candidate !== null)
    .map(pos => pos.candidate!)
    .slice(0, 20);

  if (candidatesLoading || callOrderState.loading || profilesLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <UserCheck className="w-12 h-12 mx-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Carregando perfis...
        </h3>
        <p className="text-slate-500">
          Aguarde enquanto calculamos a ordem de chamada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Perfil dos Candidatos Chamados
        </h2>
        <Badge variant="outline" className="text-sm">
          {calledCandidates.length} candidatos
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calledCandidates.map((candidate, index) => {
          const profile = getProfile(candidate.nome);
          
          return (
            <Card key={candidate.inscricao} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 leading-tight">
                      {candidate.nome}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Inscrição: {candidate.inscricao}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Data de Nascimento */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {candidate.nascimento}
                  </span>
                </div>

                {/* Formação */}
                <div className="flex items-start space-x-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Formação
                    </p>
                    <p className="text-sm text-slate-700">
                      {profile ? formatFormacao(profile.formacao) : (candidate.formacao || 'Não informado')}
                    </p>
                  </div>
                </div>

                {/* Experiência */}
                <div className="flex items-start space-x-2">
                  <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Experiência
                    </p>
                    <p className="text-sm text-slate-700">
                      {profile ? formatExperiencia(profile.experiencia_profissional) : (candidate.experiencia || 'Não informado')}
                    </p>
                  </div>
                </div>

                {/* Aprovações */}
                <div className="flex items-start space-x-2">
                  <Award className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Aprovações
                    </p>
                    <p className="text-sm text-slate-700">
                      {profile ? formatAprovacoes(profile.aprovacoes) : (candidate.aprovacoes || 'Não informado')}
                    </p>
                  </div>
                </div>

                {/* Expertise (se disponível no JSON) */}
                {profile?.expertise && profile.expertise.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 text-slate-400 mt-0.5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Expertise
                      </p>
                      <div className="space-y-1">
                        {profile.expertise.slice(0, 2).map((exp, i) => (
                          <p key={i} className="text-xs text-slate-600">
                            • {exp}
                          </p>
                        ))}
                        {profile.expertise.length > 2 && (
                          <p className="text-xs text-slate-500 italic">
                            +{profile.expertise.length - 2} mais...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {calledCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <UserCheck className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Nenhum candidato chamado
          </h3>
          <p className="text-slate-500">
            Configure a ordem de chamada para ver os perfis dos candidatos.
          </p>
        </div>
      )}
    </div>
  );
};