
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const SEOAuditReport = ({ analysis, onClose }) => {
  if (!analysis) return null;

  return html`
    <div className="w-96 bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700 animate-fadeIn pointer-events-auto">
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live SEO Audit Report</h3>
          <button onClick=${onClose} className="text-slate-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark"></i>
          </button>
      </div>
      
      <div className="flex items-center justify-between mb-8">
          <div className="text-4xl font-black text-white">${analysis.overallScore}%</div>
          <div className=${`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${analysis.overallScore > 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
              ${analysis.overallScore > 75 ? 'Optimal' : 'Needs Tuning'}
          </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Density</p>
              <p className="text-xs font-black text-blue-400">${analysis.metrics.keyphraseDensity}%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sent. Length</p>
              <p className="text-xs font-black text-blue-400">${analysis.metrics.avgSentenceLength} words</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Intro Optimized</p>
              <p className=${`text-xs font-black ${analysis.metrics.introPresence ? 'text-emerald-400' : 'text-red-400'}`}>
                ${analysis.metrics.introPresence ? 'Verified' : 'Missing'}
              </p>
          </div>
           <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Passive Voice</p>
              <p className="text-xs font-black text-blue-400">${analysis.metrics.passiveVoicePercentage}%</p>
          </div>
      </div>

      <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 text-left">
        <div>
           <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Structural Health</label>
           <p className="text-[11px] font-bold text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
             ${analysis.metrics.subheadingDistribution}
           </p>
        </div>

        <div>
           <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Readability Label</label>
           <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase">${analysis.readabilityLabel}</span>
        </div>

        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Targeted Suggestions</label>
          <ul className="space-y-3">
            ${analysis.suggestions.map((s, i) => html`
              <li key=${i} className="text-[11px] flex items-start text-slate-400 font-medium leading-relaxed">
                <i className="fa-solid fa-circle-check text-blue-500 mt-1 mr-3 shrink-0 text-[8px]"></i>
                ${s}
              </li>
            `)}
          </ul>
        </div>
      </div>
    </div>
  `;
};

export default SEOAuditReport;
