import React from 'react';
import type { Identification, Mode, NormalIdentification, HealthIdentification } from '../types';
import { CloseIcon, LinkIcon } from './Icons';

interface InfoModalProps {
  identification: Identification;
  mode: Mode;
  onClose: () => void;
}

const NormalContent: React.FC<{ data: NormalIdentification }> = ({ data }) => (
  <>
    <h2 className="text-3xl font-bold mb-2 text-white">{data.name}</h2>
    <p className="text-slate-200 mb-4">{data.description}</p>

    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg text-white mb-2">Cool Facts</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          {data.cool_facts.map((fact, i) => <li key={i}>{fact}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-lg text-white mb-2">Technicalities</h3>
        <p className="text-slate-300 bg-black/20 p-3 rounded-md">{data.technicalities}</p>
      </div>
    </div>
     {data.wikipedia_url && (
        <a 
            href={data.wikipedia_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors"
        >
            <LinkIcon className="w-5 h-5" />
            Read on Wikipedia
        </a>
    )}
  </>
);

const HealthContent: React.FC<{ data: HealthIdentification }> = ({ data }) => (
    <>
      <h2 className="text-3xl font-bold mb-2 text-yellow-300">{data.issue}</h2>
      <p className="text-slate-200 mb-4">{data.description}</p>
  
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-yellow-200 mb-2">Simple Cures & Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {data.simple_cures.map((cure, i) => <li key={i}>{cure}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-yellow-200 mb-2">Natural Remedies</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {data.natural_remedies.map((remedy, i) => <li key={i}>{remedy}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-xs text-yellow-200/80 bg-yellow-900/40 p-3 rounded-md">
        Disclaimer: This is AI-generated information and not a substitute for professional medical or botanical advice. Consult an expert for any serious concerns.
      </p>
    </>
  );

export const InfoModal: React.FC<InfoModalProps> = ({ identification, mode, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-2xl max-h-[85vh] overflow-y-auto p-8 bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
          <CloseIcon className="w-7 h-7" />
        </button>
        {mode === 'Normal' && identification.name && (
          <NormalContent data={identification as NormalIdentification} />
        )}
        {mode === 'Health' && identification.issue && (
          <HealthContent data={identification as HealthIdentification} />
        )}
      </div>
    </div>
  );
};
