
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const MediaPresets = ({ mode, loading, onPresetClick }) => {
  const assetTypes = [
    { label: 'Article Graphic', prompt: 'Educational article illustration for blog' },
    { label: 'Marketing Banner', prompt: 'High-impact conversion marketing banner' },
    { label: 'Technical Diagram', prompt: 'Clean, professional technical architecture diagram' },
    { label: 'Data Graph', prompt: 'Infographic style data visualization chart' }
  ];

  const videoTypes = [
    { label: 'Strategic Explainer', prompt: 'A smooth, executive-style animation showcasing ROI and future impacts' },
    { label: 'Technical Walkthrough', prompt: 'A macro-focus panning shot of code and architectural diagrams' },
    { label: 'Product Reveal', prompt: 'A high-energy, cinematic 3D reveal of a software dashboard' }
  ];

  const presets = mode === 'video' ? videoTypes : assetTypes;

  return html`
    <section className="bg-slate-900 p-8 rounded-[2rem] text-white">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Presets</h3>
      <div className="space-y-3">
        ${presets.map(t => html`
          <button 
            key=${t.label}
            onClick=${() => onPresetClick(t.prompt)}
            disabled=${loading}
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all text-left flex justify-between items-center group"
          >
            <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-white">${t.label}</span>
            <i className=${`fa-solid ${mode === 'video' ? 'fa-video' : 'fa-plus'} text-[10px] text-slate-500 group-hover:text-blue-200`}></i>
          </button>
        `)}
      </div>
    </section>
  `;
};

export default MediaPresets;
