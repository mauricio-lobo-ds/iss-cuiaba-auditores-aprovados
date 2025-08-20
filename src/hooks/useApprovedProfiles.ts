import { useState, useEffect } from 'react';

export interface ProfileFormacao {
  curso: string;
  tipo: 'graduacao' | 'pos_graduacao' | 'mestrado' | 'doutorado';
}

export interface ProfileExperiencia {
  empresa: string;
  cargo: string;
  tempo_exercicio?: string;
  atividades?: string[];
}

export interface ProfileAprovacao {
  concurso: string;
  cargo?: string;
  classificacao: string;
  posicao?: string;
}

export interface ApprovedProfile {
  nome: string;
  formacao?: ProfileFormacao[];
  experiencia_profissional?: ProfileExperiencia[];
  expertise?: string[];
  aprovacoes?: ProfileAprovacao[];
}

interface ApprovedData {
  profissionais: ApprovedProfile[];
}

export const useApprovedProfiles = () => {
  const [profiles, setProfiles] = useState<Map<string, ApprovedProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        // Importar o JSON diretamente
        const jsonModule = await import('../data/aprovados-info.json');
        const data: ApprovedData = jsonModule.default;
        
        // Criar um Map indexado pelo nome completo
        const profilesMap = new Map<string, ApprovedProfile>();
        data.profissionais.forEach(profile => {
          profilesMap.set(profile.nome, profile);
        });

        setProfiles(profilesMap);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar perfis dos aprovados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const getProfile = (candidateName: string): ApprovedProfile | null => {
    return profiles.get(candidateName) || null;
  };

  const formatFormacao = (formacao?: ProfileFormacao[]): string => {
    if (!formacao || formacao.length === 0) return 'Não informado';
    
    return formacao.map(f => {
      const tipoMap = {
        'graduacao': 'Graduação',
        'pos_graduacao': 'Pós-graduação',
        'mestrado': 'Mestrado',
        'doutorado': 'Doutorado'
      };
      return `${tipoMap[f.tipo]}: ${f.curso}`;
    }).join('; ');
  };

  const formatExperiencia = (experiencia?: ProfileExperiencia[]): string => {
    if (!experiencia || experiencia.length === 0) return 'Não informado';
    
    return experiencia.map(exp => {
      const tempo = exp.tempo_exercicio ? ` (${exp.tempo_exercicio})` : '';
      return `${exp.cargo} - ${exp.empresa}${tempo}`;
    }).join('; ');
  };

  const formatAprovacoes = (aprovacoes?: ProfileAprovacao[]): string => {
    if (!aprovacoes || aprovacoes.length === 0) return 'Não informado';
    
    return aprovacoes.map(aprov => {
      const cargo = aprov.cargo ? ` - ${aprov.cargo}` : '';
      const posicao = aprov.posicao ? ` (${aprov.posicao})` : ` (${aprov.classificacao}º)`;
      return `${aprov.concurso}${cargo}${posicao}`;
    }).join('; ');
  };

  return {
    profiles,
    loading,
    error,
    getProfile,
    formatFormacao,
    formatExperiencia,
    formatAprovacoes
  };
};