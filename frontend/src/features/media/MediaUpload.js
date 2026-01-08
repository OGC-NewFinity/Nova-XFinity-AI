
import React, { useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const MediaUpload = ({ sourceImage, onFileChange }) => {
  const fileInputRef = useRef(null);

  return html`
    <div className="space-y-4 pt-2">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
        Source Asset
      </label>
      <div 
        onClick=${() => fileInputRef.current.click()}
        className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all group overflow-hidden"
      >
        ${sourceImage ? html`
          <img src=${sourceImage} className="w-full h-full object-cover" />
        ` : html`
          <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-300 mb-3 group-hover:text-blue-500 transition-colors"></i>
          <span className="text-[10px] font-black text-slate-400 uppercase text-center px-4">Upload Asset</span>
        `}
        <input type="file" hidden ref=${fileInputRef} onChange=${onFileChange} accept="image/*" />
      </div>
    </div>
  `;
};

export default MediaUpload;
