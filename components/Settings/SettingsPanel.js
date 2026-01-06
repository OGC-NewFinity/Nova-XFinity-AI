import React from 'react';
import htm from 'htm';
import { PROVIDER_OPTIONS } from '../../constants.js';

const html = htm.bind(React.createElement);

const SettingsPanel = ({ settings, onSettingsChange, onSave }) => {
  return html`
    <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 max-w-3xl mx-auto animate-fadeIn shadow-xl shadow-slate-200/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Agent Infrastructure</h2>
        <p className="text-slate-500 font-medium">Select your primary engine and manage enterprise API keys.</p>
      </div>
      
      <div className="space-y-10">
        <!-- Provider Selector -->
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">Active Service Provider</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${PROVIDER_OPTIONS.map(p => html`
              <button 
                key=${p.id}
                onClick=${() => onSettingsChange({...settings, provider: p.id})}
                className=${`p-5 rounded-2xl border-2 transition-all flex flex-col items-center group relative overflow-hidden ${settings.provider === p.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <i className=${`fa-solid ${p.icon} text-2xl mb-3 ${settings.provider === p.id ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}></i>
                <span className=${`text-[9px] font-black uppercase tracking-tight ${settings.provider === p.id ? 'text-blue-600' : 'text-slate-500'}`}>${p.label}</span>
                <span className="mt-1 text-[7px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">${p.badge}</span>
              </button>
            `)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Google Gemini (Default)</label>
              <div className="relative">
                <input type="text" readOnly value="Native Context System" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 shadow-inner" />
                <i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">OpenAI API Key</label>
              <input type="password" value=${settings.openaiKey || ''} onChange=${e => onSettingsChange({...settings, openaiKey: e.target.value})} placeholder="sk-..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 font-mono text-xs shadow-sm" />
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Anthropic Claude Key</label>
              <input type="password" value=${settings.claudeKey || ''} onChange=${e => onSettingsChange({...settings, claudeKey: e.target.value})} placeholder="sk-ant-..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 font-mono text-xs shadow-sm" />
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Groq / Llama API Key</label>
              <input type="password" value=${settings.llamaKey || ''} onChange=${e => onSettingsChange({...settings, llamaKey: e.target.value})} placeholder="gsk-..." className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 font-mono text-xs shadow-sm" />
           </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Manual Global Focus Keyphrase</label>
          <input type="text" placeholder="e.g., Enterprise WordPress SEO..." value=${settings.focusKeyphrase || ''} onChange=${e => onSettingsChange({...settings, focusKeyphrase: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 text-sm outline-none transition-all shadow-sm" />
        </div>

        <button onClick=${onSave} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
           Save Infrastructure Settings
        </button>
      </div>
    </div>
  `;
};

export default SettingsPanel;
