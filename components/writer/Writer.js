
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import CustomDropdown from '../common/CustomDropdown.js';
import MetadataCard from './MetadataCard.js';
import SectionBlock from './SectionBlock.js';
import SEOAuditReport from './SEOAuditReport.js';
import CTABlock from './CTABlock.js';
import ImageBlock from './ImageBlock.js';
import PublishModal from './PublishModal.js';
import { 
  TONE_OPTIONS, LANGUAGE_OPTIONS, ARTICLE_TYPE_OPTIONS, ARTICLE_SIZE_OPTIONS, 
  POV_OPTIONS, IMAGE_QUANTITY_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS,
  CATEGORY_OPTIONS, PROVIDER_OPTIONS
} from '../../constants.js';
import { 
  generateOutline, generateSection, analyzeSEO, generateMetadata 
} from '../../services/geminiService.js';

const html = htm.bind(React.createElement);

const Writer = ({ settings }) => {
  const [config, setConfig] = useState({
    topic: '',
    keywords: [],
    sourceContext: '',
    category: 'Technical (Development/Engineering)',
    tone: 'Professional',
    language: 'English (US)',
    articleType: 'None (General Post)',
    articleSize: 'Medium (1,200-1,800 words)',
    pov: 'None (Neutral/Mix)',
    imageQuantity: '2',
    aspectRatio: '16:9',
    imageStyle: 'Photorealistic'
  });
  
  const [metadata, setMetadata] = useState(null);
  const [sections, setSections] = useState([]);
  const [ctaContent, setCtaContent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [showDraftLibrary, setShowDraftLibrary] = useState(false);
  const [autosavePulse, setAutosavePulse] = useState(false);
  const [autoTriggerAllMedia, setAutoTriggerAllMedia] = useState(false);
  const [isPublishingModalOpen, setIsPublishingModalOpen] = useState(false);

  const activeProvider = PROVIDER_OPTIONS.find(p => p.id === settings.provider) || PROVIDER_OPTIONS[0];

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('finity_drafts') || '[]');
    setSavedDrafts(drafts);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (config.topic || sections.length > 0) {
        saveDraft(true);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [config, metadata, sections, ctaContent]);

  const saveDraft = (silent = false) => {
    const currentDrafts = JSON.parse(localStorage.getItem('finity_drafts') || '[]');
    const newDraft = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      title: metadata?.seoTitle || config.topic || 'Untitled Post',
      config,
      metadata,
      sections,
      ctaContent
    };
    
    const updatedDrafts = [newDraft, ...currentDrafts.filter(d => d.title !== newDraft.title || (Date.now() - d.id > 3600000))].slice(0, 10);
    localStorage.setItem('finity_drafts', JSON.stringify(updatedDrafts));
    setSavedDrafts(updatedDrafts);
    
    if (!silent) {
      setAutosavePulse(true);
      setTimeout(() => setAutosavePulse(false), 2000);
    }
  };

  const loadDraft = (draft) => {
    setConfig(draft.config);
    setMetadata(draft.metadata);
    setSections(draft.sections);
    setCtaContent(draft.ctaContent || '');
    setShowDraftLibrary(false);
    setAutoTriggerAllMedia(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNewArticle = () => {
    if (config.topic && !confirm("Clear workspace? Current work is in library.")) return;
    setConfig({
      topic: '',
      keywords: [],
      sourceContext: '',
      category: 'Technical (Development/Engineering)',
      tone: 'Professional',
      language: 'English (US)',
      articleType: 'None (General Post)',
      articleSize: 'Medium (1,200-1,800 words)',
      pov: 'None (Neutral/Mix)',
      imageQuantity: '2',
      aspectRatio: '16:9',
      imageStyle: 'Photorealistic'
    });
    setMetadata(null);
    setSections([]);
    setCtaContent('');
    setAnalysis(null);
    setAutoTriggerAllMedia(false);
  };

  const handleStartGeneration = async () => {
    if (!config.topic) return;
    setLoading(true);
    setAutoTriggerAllMedia(false);
    try {
      const manualKeyphrase = settings?.focusKeyphrase || '';
      const meta = await generateMetadata(config.topic, config.keywords, config.articleType, config.language, config.articleSize, config.pov, manualKeyphrase, config.imageStyle, config.aspectRatio, config.sourceContext, config.category);
      setMetadata(meta);

      const outline = await generateOutline(config.topic, [meta.focusKeyphrase, ...config.keywords], config.articleType, config.language, config.articleSize, config.pov, config.sourceContext, config.category);
      const initialSections = outline.map((title) => ({
        title,
        body: '',
        isGenerating: false
      }));
      setSections(initialSections);
      setCtaContent('');
    } catch (e) {
      console.error(e);
      alert("Error generating content plan. Please check API keys in Settings.");
    } finally {
      setLoading(false);
    }
  };

  const generateContentForSection = async (index) => {
    const section = sections[index];
    setSections(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: true } : s));
    
    try {
      const focusKw = metadata?.focusKeyphrase || '';
      const content = await generateSection(
        section.title, 
        config.topic, 
        [focusKw, ...config.keywords], 
        config.tone,
        config.articleType,
        config.language,
        config.articleSize,
        config.pov,
        config.imageQuantity,
        config.aspectRatio,
        config.imageStyle,
        config.sourceContext,
        config.category
      );
      setSections(prev => prev.map((s, i) => i === index ? { ...s, body: content || '', isGenerating: false } : s));
      setTimeout(() => saveDraft(true), 500);
    } catch (e) {
      console.error(e);
      setSections(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: false } : s));
    }
  };

  const processKeywords = (input) => {
    if (!input.trim()) return;
    const newKeywords = input.split(',').map(kw => kw.trim()).filter(kw => kw !== '' && !config.keywords.includes(kw));
    if (newKeywords.length > 0) {
      setConfig(prev => ({ ...prev, keywords: [...prev.keywords, ...newKeywords] }));
    }
    setKeywordInput('');
  };

  const inputClass = "w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 font-bold transition-all shadow-sm text-sm tracking-tight";

  return html`
    <div className="max-w-[95%] mx-auto space-y-12 animate-fadeIn py-6">
      <!-- Layer 1: Configuration -->
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

      <!-- Layer 2: Editor Workspace -->
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[800px] relative">
        <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-6">
               <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center"><i className="fa-solid fa-newspaper mr-3 text-blue-500"></i> Editor Workspace</h3>
               <button onClick=${() => setShowDraftLibrary(!showDraftLibrary)} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-box-archive mr-2"></i> Draft Library (${savedDrafts.length})</button>
               <div className="flex items-center space-x-2 border-l border-slate-800 pl-6 ml-2">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Engine: ${activeProvider.label}</span>
               </div>
            </div>
            <div className="flex space-x-3">
              <button onClick=${() => setAutoTriggerAllMedia(true)} disabled=${sections.length === 0} className="px-5 py-2.5 text-[10px] font-black uppercase bg-slate-800 text-white rounded-xl border border-slate-700 disabled:opacity-50"><i className="fa-solid fa-images mr-2 text-blue-400"></i> FinityHub Media</button>
              <button onClick=${async () => {
                const fullText = sections.map(s => `<h2>${s.title}</h2>${s.body}`).join('\n') + ctaContent;
                if (!fullText.trim()) return;
                setLoading(true);
                const result = await analyzeSEO(fullText, [metadata?.focusKeyphrase || '', ...config.keywords]);
                setAnalysis(result);
                setLoading(false);
              }} disabled=${loading || sections.length === 0} className="px-5 py-2.5 text-[10px] font-black uppercase bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10">SEO Audit</button>
              <button 
                onClick=${() => {
                  if (sections.length === 0 || sections.some(s => !s.body)) {
                    alert("Generate all content blocks before publishing.");
                    return;
                  }
                  setIsPublishingModalOpen(true);
                }} 
                className="px-5 py-2.5 text-[10px] font-black uppercase bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-95"
              >
                Publish to WordPress
              </button>
            </div>
        </div>

        ${showDraftLibrary && html`
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] animate-fadeIn p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto">
               <div className="flex justify-between items-center mb-10">
                  <h4 className="text-xl font-black text-white uppercase tracking-widest">Snapshot Library</h4>
                  <button onClick=${() => setShowDraftLibrary(false)} className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${savedDrafts.length === 0 ? html`<p className="text-slate-600 font-bold text-center col-span-2 py-20">No snapshots found.</p>` : savedDrafts.map(draft => html`
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
                       <span className="text-[9px] font-black text-blue-500 uppercase mb-2 block">${draft.timestamp}</span>
                       <h5 className="text-white font-black text-lg mb-6 line-clamp-1">${draft.title}</h5>
                       <button onClick=${() => loadDraft(draft)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Load Snapshot</button>
                    </div>
                  `)}
               </div>
            </div>
          </div>
        `}

        <div className="flex-1 p-10 space-y-12">
            <div className="max-w-[90%] mx-auto space-y-12">
                <${MetadataCard} metadata=${metadata} manualOverride=${!!settings?.focusKeyphrase} />

                ${sections.length === 0 ? html`
                  <div className="h-[400px] flex flex-col items-center justify-center text-slate-200 space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center"><i className="fa-solid fa-layer-group text-4xl"></i></div>
                    <p className="font-black text-lg text-slate-300">Editor Workspace Idle</p>
                  </div>
                ` : html`
                  ${metadata?.featuredImage && html`
                    <div className="border-b border-slate-100 pb-12 mb-12">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 block flex items-center">
                        <i className="fa-solid fa-star mr-2"></i> Primary Featured Image
                      </span>
                      <${ImageBlock} 
                        metadata=${metadata.featuredImage} 
                        autoTrigger=${autoTriggerAllMedia} 
                        label="Featured Brand Asset"
                      />
                    </div>
                  `}

                  ${sections.map((section, idx) => html`
                      <${SectionBlock} 
                        key=${idx} 
                        section=${section} 
                        idx=${idx} 
                        isOptimized=${metadata?.focusKeyphrase && section.title.toLowerCase().includes(metadata.focusKeyphrase.toLowerCase())} 
                        onGenerate=${() => generateContentForSection(idx)}
                        autoTriggerAllMedia=${autoTriggerAllMedia} 
                      />
                  `)}
                  
                  <${CTABlock} 
                    topic=${config.topic}
                    keywords=${config.keywords}
                    focusKeyphrase=${metadata?.focusKeyphrase || ''}
                    existingCTA=${ctaContent}
                    onCTAGenerated=${(content) => setCtaContent(content)}
                  />
                `}
            </div>
        </div>

        <div className="fixed bottom-10 right-10 flex flex-col space-y-4 z-[100] items-end pointer-events-none">
          <${SEOAuditReport} analysis=${analysis} onClose=${() => setAnalysis(null)} />
        </div>
      </section>

      <${PublishModal} 
        isOpen=${isPublishingModalOpen} 
        onClose=${() => setIsPublishingModalOpen(false)} 
        metadata=${metadata} 
        sections=${sections} 
      />
    </div>
  `;
};

export default Writer;
