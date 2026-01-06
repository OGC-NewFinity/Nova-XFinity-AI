
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants.js";

const getSavedSettings = () => {
  const saved = localStorage.getItem('finity_settings');
  return saved ? JSON.parse(saved) : { provider: 'gemini' };
};

const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API_KEY not found in process.env");
    return null;
  }
};

const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: getApiKey(), 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      key: settings.openaiKey, 
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      key: settings.claudeKey, 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      key: settings.llamaKey, 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};

const cleanAIOutput = (text) => {
  if (!text) return "";
  let cleaned = text.replace(/```(?:html|markdown|xml|json)?\n?([\s\S]*?)\n?```/gi, '$1');
  cleaned = cleaned.replace(/^Sure,? here is the.*:?\n?/gi, '');
  cleaned = cleaned.replace(/^#+ .*\n/gi, ''); 
  return cleaned.trim();
};

/**
 * GENERIC CALLER WITH FALLBACK
 */
const callAI = async (prompt, systemPrompt, jsonMode = false) => {
  const config = getProviderConfig();
  
  if (!config.key && config.id !== 'gemini') {
    throw new Error(`API Key missing for ${config.id}. Please configure in Settings.`);
  }

  try {
    if (config.id === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: config.key });
      const response = await ai.models.generateContent({
        model: config.model,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      });
      return response.text;
    }

    // Fallback standard Fetch for other providers
    const isOpenAICompatible = ['openai', 'llama'].includes(config.id);
    
    const payload = isOpenAICompatible ? {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {})
    } : {
      model: config.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096
    };

    const headers = {
      'Content-Type': 'application/json',
      ...(config.id === 'openai' && { 'Authorization': `Bearer ${config.key}` }),
      ...(config.id === 'llama' && { 'Authorization': `Bearer ${config.key}` }),
      ...(config.id === 'anthropic' && { 
        'x-api-key': config.key, 
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      })
    };

    const res = await fetch(config.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Provider ${config.id} failed: ${res.statusText}`);
    
    const data = await res.json();
    if (config.id === 'anthropic') return data.content[0].text;
    return data.choices[0].message.content;

  } catch (error) {
    console.warn("Primary provider failed, attempting fallback to Gemini...", error);
    // Silent Fallback to Gemini if it's not the primary
    if (config.id !== 'gemini') {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `[FALLBACK MODE] ${prompt}`,
        config: { systemInstruction: systemPrompt }
      });
      return response.text;
    }
    throw error;
  }
};

export const generateMetadata = async (topic, keywords, articleType, language, articleSize, pov, manualFocusKeyphrase, imageStyle, aspectRatio, sourceContext, category) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.`;
  const prompt = `Topic: "${topic}"\nKeywords: "${keywords.join(', ')}"\nPOV: ${pov}\nType: ${articleType}\nSourceContext: ${sourceContext}\nManualFocus: ${manualFocusKeyphrase}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

export const generateOutline = async (topic, keywords, articleType, language, articleSize, pov, sourceContext, category) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of section headings ONLY.`;
  const prompt = `Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '[]');
};

export const generateSection = async (sectionTitle, topic, keywords, tone, articleType, language, articleSize, pov, imageQuantity, aspectRatio, imageStyle, sourceContext, category) => {
  const systemPrompt = SYSTEM_INSTRUCTIONS;
  const prompt = `Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"`;
  
  const text = await callAI(prompt, systemPrompt, false);
  return cleanAIOutput(text);
};

export const generateCTA = async (topic, keywords, focusKeyphrase) => {
  const text = await callAI(`Create a branded Finity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}`, SYSTEM_INSTRUCTIONS, false);
  return cleanAIOutput(text);
};

// MEDIA METHODS
export const generateImage = async (prompt, aspectRatio = "16:9", style = "Photorealistic") => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Professional asset. Style: ${style}. Subject: ${prompt}.` }] },
    config: { imageConfig: { aspectRatio } },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const editImage = async (base64ImageData, mimeType, prompt, aspectRatio = "16:9") => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64ImageData.split(',')[1] || base64ImageData, mimeType } },
        { text: `Modify the provided image: "${prompt}".` }
      ]
    },
    config: { imageConfig: { aspectRatio } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateVideo = async (prompt, style = 'Cinematic', resolution = '720p', aspectRatio = '16:9', duration = '9s', startFrameBase64 = null) => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const requestConfig = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Visual Style: ${style}. Duration: ${duration}. ${prompt}`,
    config: { 
      numberOfVideos: 1, 
      resolution: resolution === '720p' || resolution === '1080p' ? resolution : '720p', 
      aspectRatio: aspectRatio === '16:9' || aspectRatio === '9:16' ? aspectRatio : '16:9'
    }
  };
  
  if (startFrameBase64) {
    requestConfig.image = { 
      imageBytes: startFrameBase64.split(',')[1] || startFrameBase64, 
      mimeType: 'image/png' 
    };
  }
  
  let operation = await ai.models.generateVideos(requestConfig);
  
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({operation});
    
    // Check for operation error
    if (operation.error) {
      throw new Error(`Video Generation Operation Failed: ${operation.error.message || 'Unknown Error'}`);
    }
  }

  const videoMeta = operation.response?.generatedVideos?.[0]?.video;
  if (!videoMeta || !videoMeta.uri) {
    throw new Error("Video generation completed but no URI was returned.");
  }

  const downloadLink = videoMeta.uri;
  // Ensure the URL parameter joining is correct
  const separator = downloadLink.includes('?') ? '&' : '?';
  return `${downloadLink}${separator}key=${apiKey}`;
};

export const generateAudio = async (text, voice = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a professional marketing tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  
  return `data:audio/pcm;base64,${base64Audio}`;
};

// AUDIO UTILITIES
export function decodeBase64(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data, ctx, sampleRate = 24000, numChannels = 1) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const checkPlagiarism = async (content) => {
  const text = await callAI(`Scan for originality: ${content.substring(0, 5000)}`, SYSTEM_INSTRUCTIONS, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

export const performResearch = async (query) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Deep Research: ${query}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web?.title || 'Source', uri: chunk.web?.uri || '' })) || [];
  return { summary: response.text, sources };
};

export const analyzeSEO = async (content, keywords) => {
  const text = await callAI(`SEO audit: ${keywords[0]}. Content: ${content.substring(0, 5000)}`, SYSTEM_INSTRUCTIONS, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};
