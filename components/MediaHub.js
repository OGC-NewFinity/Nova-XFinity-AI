
import React, { useState, useRef } from 'react';
import htm from 'htm';
import { generateImage, editImage, generateVideo, generateAudio, decodeBase64, decodeAudioData } from '../services/geminiService.js';
import CustomDropdown from './common/CustomDropdown.js';
import { ASPECT_RATIO_OPTIONS, VIDEO_ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS, VIDEO_DURATION_OPTIONS } from '../constants.js';

const html = htm.bind(React.createElement);

const MediaHub = () => {
  const [mode, setMode] = useState('generate'); // generate | edit | video
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspect, setAspect] = useState('16:9');
  const [duration, setDuration] = useState('9s');
  const [withVoice, setWithVoice] = useState(false);
  const [resolution, setResolution] = useState('720p');
  const [resultImage, setResultImage] = useState(null);
  const [resultVideo, setResultVideo] = useState(null);
  const [resultAudio, setResultAudio] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const audioContextRef = useRef(null);

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

  const playTTS = async (base64Audio) => {
    if (!base64Audio) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const data = decodeBase64(base64Audio.split(',')[1]);
      const buffer = await decodeAudioData(data, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const handleGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    setResultVideo(null);
    setResultAudio(null);
    try {
      const url = await generateImage(finalPrompt, aspect, style);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      alert("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;
    setLoading(true);
    setResultVideo(null);
    setResultAudio(null);
    try {
      const url = await editImage(sourceImage, 'image/png', prompt, aspect);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      alert("Editing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;

    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Veo video generation requires a paid API key.");
        await window.aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setResultImage(null);
    setResultVideo(null);
    setResultAudio(null);
    setStatusMessage('Finity Engine Initiating Video Synthesis...');
    
    const messages = [
      'Analyzing temporal coherence...',
      'Synthesizing keyframes...',
      'Optimizing for motion fluidness...',
      'Assembling MP4 stream...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setStatusMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 12000);

    try {
      // Parallel generation if voice is enabled
      const videoPromise = generateVideo(finalPrompt, style, resolution, aspect, duration, sourceImage);
      let audioPromise = null;
      
      if (withVoice) {
        audioPromise = generateAudio(`Welcome to this ${style} presentation about ${finalPrompt.substring(0, 50)}...`);
      }

      const [videoUrl, audioUrl] = await Promise.all([videoPromise, audioPromise]);
      
      setResultVideo(videoUrl);
      if (audioUrl) {
        setResultAudio(audioUrl);
        // Auto-play introduction
        playTTS(audioUrl);
      }
    } catch (e) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found.")) {
         alert("API Key error. Please re-select your key.");
         if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      } else {
         alert("Synthesis failed.");
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMessage('');
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">FinityHub Media</h2>
          <p className="text-slate-500 mt-2 font-medium">Generate high-impact assets with Veo 3.1 & Gemini Multimodal.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           ${['generate', 'edit', 'video'].map(m => html`
             <button 
               key=${m}
               onClick=${() => setMode(m)} 
               className=${`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               ${m === 'video' ? 'Video Gen' : m.charAt(0).toUpperCase() + m.slice(1)}
             </button>
           `)}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center">
               <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Parameters
            </h3>
            
            <${CustomDropdown} label="Art Style" options=${IMAGE_STYLE_OPTIONS} value=${style} onChange=${setStyle} />
            <${CustomDropdown} 
              label="Aspect Ratio" 
              options=${mode === 'video' ? VIDEO_ASPECT_RATIO_OPTIONS : ASPECT_RATIO_OPTIONS} 
              value=${aspect} 
              onChange=${setAspect} 
            />

            ${mode === 'video' && html`
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Video Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    ${VIDEO_DURATION_OPTIONS.map(d => html`
                      <button 
                        key=${d}
                        onClick=${() => setDuration(d)}
                        className=${`py-2 rounded-xl text-[10px] font-black border transition-all ${duration === d ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        ${d}
                      </button>
                    `)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <i className=${`fa-solid fa-microphone-lines text-blue-500 ${withVoice ? 'animate-pulse' : ''}`}></i>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">AI Voiceover Intro</span>
                  </div>
                  <button 
                    onClick=${() => setWithVoice(!withVoice)}
                    className=${`w-10 h-6 rounded-full transition-all relative ${withVoice ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className=${`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${withVoice ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            `}

            ${(mode === 'edit' || mode === 'video') && html`
              <div className="space-y-4 pt-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  ${mode === 'video' ? 'Starting Frame (Reference)' : 'Source Asset'}
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
            `}

            <div className="pt-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instruction</label>
              <textarea 
                className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-600 font-bold transition-all text-sm min-h-[120px] resize-none"
                placeholder="Describe your vision..."
                value=${prompt}
                onChange=${e => setPrompt(e.target.value)}
              ></textarea>
            </div>

            <button 
              disabled=${loading || (mode === 'edit' && !sourceImage)}
              onClick=${() => mode === 'video' ? handleVideoGenerate() : mode === 'generate' ? handleGenerate() : handleEdit()}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing...` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Synthesize`}
            </button>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Presets</h3>
            <div className="space-y-3">
              ${(mode === 'video' ? videoTypes : assetTypes).map(t => html`
                <button 
                  key=${t.label}
                  onClick=${() => mode === 'video' ? handleVideoGenerate(t.prompt) : handleGenerate(t.prompt)}
                  disabled=${loading}
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all text-left flex justify-between items-center group"
                >
                  <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-white">${t.label}</span>
                  <i className=${`fa-solid ${mode === 'video' ? 'fa-video' : 'fa-plus'} text-[10px] text-slate-500 group-hover:text-blue-200`}></i>
                </button>
              `)}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[650px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                  <i className=${`fa-solid ${resultVideo ? 'fa-clapperboard' : 'fa-image'} text-blue-600 mr-2`}></i> Output Preview
                </h3>
                ${(resultImage || resultVideo) && html`
                  <button onClick=${() => {
                    const link = document.createElement('a');
                    link.href = resultImage || resultVideo;
                    link.download = resultVideo ? 'finity-video.mp4' : 'finity-asset.png';
                    link.click();
                  }} className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center hover:bg-blue-50 px-4 py-2 rounded-lg transition-all">
                    <i className="fa-solid fa-download mr-2"></i> Download
                  </button>
                `}
             </div>

             <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
                ${loading ? html`
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                      <i className=${`fa-solid ${mode === 'video' ? 'fa-clapperboard' : 'fa-wand-magic-sparkles'} text-3xl text-blue-500`}></i>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-800 font-black text-xs uppercase tracking-widest animate-pulse">${statusMessage || 'Synthesizing...'}</p>
                    </div>
                  </div>
                ` : resultVideo ? html`
                  <div className="space-y-6 w-full flex flex-col items-center">
                    <video src=${resultVideo} controls autoPlay loop className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white animate-fadeIn" />
                    ${resultAudio && html`
                      <button onClick=${() => playTTS(resultAudio)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg">
                        <i className="fa-solid fa-volume-high mr-2 text-blue-400"></i> Replay Voiceover
                      </button>
                    `}
                  </div>
                ` : resultImage ? html`
                  <img src=${resultImage} className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white animate-fadeIn" />
                ` : html`
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                       <i className=${`fa-solid ${mode === 'video' ? 'fa-video' : 'fa-mountain-sun'} text-4xl text-slate-200`}></i>
                    </div>
                    <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">Ready to synthesize custom brand assets.</p>
                  </div>
                `}
             </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default MediaHub;
