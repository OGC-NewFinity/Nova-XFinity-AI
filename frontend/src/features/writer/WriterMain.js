
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import WriterConfig from './WriterConfig.js';
import WriterToolbar from './WriterToolbar.js';
import WriterEditor from './WriterEditor.js';
import DraftLibrary from './DraftLibrary.js';
import SEOAuditReport from './SEOAuditReport.js';
import PublishModal from './PublishModal.js';
import { 
  generateOutline, generateSection, generateMetadata 
} from '../../services/geminiArticleService.js';
import { analyzeSEO } from '../../services/geminiSeoService.js';

const html = htm.bind(React.createElement);

const WriterMain = ({ settings }) => {
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

  const handleAnalyzeSEO = async () => {
    const fullText = sections.map(s => `<h2>${s.title}</h2>${s.body}`).join('\n') + ctaContent;
    if (!fullText.trim()) return;
    setLoading(true);
    const result = await analyzeSEO(fullText, [metadata?.focusKeyphrase || '', ...config.keywords]);
    setAnalysis(result);
    setLoading(false);
  };

  return html`
    <div className="max-w-[95%] mx-auto space-y-12 animate-fadeIn py-6">
      <${WriterConfig} 
        config=${config}
        setConfig=${setConfig}
        keywordInput=${keywordInput}
        setKeywordInput=${setKeywordInput}
        processKeywords=${processKeywords}
        handleStartGeneration=${handleStartGeneration}
        loading=${loading}
        autosavePulse=${autosavePulse}
        startNewArticle=${startNewArticle}
        settings=${settings}
      />

      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[800px] relative">
        <${WriterToolbar}
          sections=${sections}
          setAutoTriggerAllMedia=${setAutoTriggerAllMedia}
          analyzeSEO=${handleAnalyzeSEO}
          loading=${loading}
          setIsPublishingModalOpen=${setIsPublishingModalOpen}
          setShowDraftLibrary=${setShowDraftLibrary}
          savedDrafts=${savedDrafts}
          settings=${settings}
        />

        <${DraftLibrary}
          isOpen=${showDraftLibrary}
          onClose=${() => setShowDraftLibrary(false)}
          savedDrafts=${savedDrafts}
          onLoadDraft=${loadDraft}
        />

        <${WriterEditor}
          metadata=${metadata}
          sections=${sections}
          ctaContent=${ctaContent}
          setCtaContent=${setCtaContent}
          config=${config}
          generateContentForSection=${generateContentForSection}
          autoTriggerAllMedia=${autoTriggerAllMedia}
          settings=${settings}
        />

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

export default WriterMain;
