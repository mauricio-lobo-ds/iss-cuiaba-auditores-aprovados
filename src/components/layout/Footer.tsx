import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-slate-600 text-sm">
            © 2025 Sistema de Ordenação de Candidatos - Concurso Auditor Fiscal Tributário Cuiabá-MT
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Desenvolvido seguindo Clean Architecture e princípios SOLID
          </p>
        </div>
      </div>
    </footer>
  );
};