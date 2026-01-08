
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const DraftLibrary = ({ isOpen, onClose, savedDrafts, onLoadDraft }) => {
  if (!isOpen) return null;

  return html`
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] animate-fadeIn p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
         <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-black text-white uppercase tracking-widest">Snapshot Library</h4>
            <button onClick=${onClose} className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${savedDrafts.length === 0 ? html`<p className="text-slate-600 font-bold text-center col-span-2 py-20">No snapshots found.</p>` : savedDrafts.map(draft => html`
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
                 <span className="text-[9px] font-black text-blue-500 uppercase mb-2 block">${draft.timestamp}</span>
                 <h5 className="text-white font-black text-lg mb-6 line-clamp-1">${draft.title}</h5>
                 <button onClick=${() => onLoadDraft(draft)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Load Snapshot</button>
              </div>
            `)}
         </div>
      </div>
    </div>
  `;
};

export default DraftLibrary;
