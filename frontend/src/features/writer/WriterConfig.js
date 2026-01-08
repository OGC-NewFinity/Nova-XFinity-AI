
import React from 'react';
import htm from 'htm';
import CustomDropdown from '../../../components/common/CustomDropdown.js';
import { 
  TONE_OPTIONS, LANGUAGE_OPTIONS, ARTICLE_TYPE_OPTIONS, ARTICLE_SIZE_OPTIONS, 
  POV_OPTIONS, IMAGE_QUANTITY_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS,
  CATEGORY_OPTIONS, PROVIDER_OPTIONS
} from '../../../../constants.js';

const html = htm.bind(React.createElement);

const WriterConfig = ({ config, setConfig, keywordInput, setKeywordInput, processKeywords, handleStartGeneration, loading, autosavePulse, startNewArticle, settings }) => {
  const activeProvider = PROVIDER_OPTIONS.find(p => p.id === settings.provider) || PROVIDER_OPTIONS[0];
  const inputClass = "w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 font-bold transition-all shadow-sm text-sm tracking-tight";

  return html`
    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black flex items-center text-slate-800 uppercase tracking-widest">
              <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Post Configuration
          </h3>
          <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <i className=${`fa-solid ${activeProvider.icon} text-blue-600 text-[10px]`}></i>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">${activeProvider.label}</span>
              </div>
              ${autosavePulse && html`<span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center animate-pulse"><i className="fa-solid fa-floppy-disk mr-2"></i> Draft Saved</span>`}
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Target Topic</label>
            <input type="text" className=${inputClass} placeholder="Enter article topic..." value=${config.topic} onChange=${e => setConfig({ ...config, topic: e.target.value })} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Primary Keywords</label>
            <div className="flex space-x-2">
              <input type="text" className=${inputClass} placeholder="Paste keywords..." value=${keywordInput} onChange=${e => e.target.value.includes(',') ? processKeywords(e.target.value) : setKeywordInput(e.target.value)} onKeyDown=${e => e.key === 'Enter' && processKeywords(keywordInput)} />
              <button onClick=${() => processKeywords(keywordInput)} className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/10"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              ${config.keywords.map(kw => html`<span key=${kw} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-blue-100 flex items-center transition-all hover:bg-blue-100">${kw}<button onClick=${() => setConfig({ ...config, keywords: config.keywords.filter(k => k !== kw) })} className="ml-2 text-blue-400 hover:text-red-500"><i className="fa-solid fa-xmark"></i></button></span>`)}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest flex items-center">
               <i className="fa-solid fa-microscope mr-2 text-blue-500"></i> Pulse Mode: Expert Source Context
            </label>
            <textarea 
              className=${`${inputClass} h-24 resize-none font-medium leading-relaxed`} 
              placeholder="Paste RSS feed text or technical notes to enable Senior Technical Journalist mode..." 
              value=${config.sourceContext} 
              onChange=${e => setConfig({ ...config, sourceContext: e.target.value })}
            ></textarea>
          </div>

          <${CustomDropdown} label="Selected Category" options=${CATEGORY_OPTIONS} value=${config.category} onChange=${v => setConfig({...config, category: v})} />
          <${CustomDropdown} label="Article Type" options=${ARTICLE_TYPE_OPTIONS} value=${config.articleType} onChange=${v => setConfig({...config, articleType: v})} />
          <${CustomDropdown} label="Article Size" options=${ARTICLE_SIZE_OPTIONS} value=${config.articleSize} onChange=${v => setConfig({...config, articleSize: v})} />
          <${CustomDropdown} label="Narrative POV" options=${POV_OPTIONS} value=${config.pov} onChange=${v => setConfig({...config, pov: v})} />
          <${CustomDropdown} label="Language" type="language" options=${LANGUAGE_OPTIONS} value=${config.language} onChange=${v => setConfig({...config, language: v})} />
          <${CustomDropdown} label="Image Quantity" options=${IMAGE_QUANTITY_OPTIONS} value=${config.imageQuantity} onChange=${v => setConfig({...config, imageQuantity: v})} />
          <${CustomDropdown} label="Image Aspect Ratio" options=${ASPECT_RATIO_OPTIONS} value=${config.aspectRatio} onChange=${v => setConfig({...config, aspectRatio: v})} />
          <${CustomDropdown} label="Image Style" options=${IMAGE_STYLE_OPTIONS} value=${config.imageStyle} onChange=${v => setConfig({...config, imageStyle: v})} />
      </div>

      <div className="mt-8 flex justify-end items-center space-x-6">
          <button onClick=${startNewArticle} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 mr-auto"><i className="fa-solid fa-trash-can mr-2"></i> Reset Workspace</button>
          <button onClick=${handleStartGeneration} disabled=${loading || !config.topic} className="px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i>`} Initialize Agent
          </button>
      </div>
    </section>
  `;
};

export default WriterConfig;
