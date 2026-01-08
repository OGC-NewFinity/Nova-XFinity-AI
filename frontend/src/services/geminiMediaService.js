/**
 * Gemini Media Service
 * Frontend service for media generation and manipulation
 * 
 * This service handles all media-related AI operations including:
 * - Image generation and editing
 * - Video generation
 * - Audio/TTS generation
 * - Media data encoding/decoding utilities
 * 
 * @module services/geminiMediaService
 */

import api from './api.js';

/**
 * Decode base64 string to bytes
 * Utility function for converting base64 encoded data to Uint8Array
 * 
 * @param {string} base64 - Base64 encoded string
 * @returns {Uint8Array} Decoded bytes array
 */
export function decodeBase64(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode audio data to AudioBuffer
 * Converts raw audio bytes to Web Audio API AudioBuffer for playback
 * 
 * @param {Uint8Array} data - Raw audio data bytes
 * @param {AudioContext} ctx - Web Audio API AudioContext
 * @param {number} sampleRate - Audio sample rate (default: 24000)
 * @param {number} numChannels - Number of audio channels (default: 1)
 * @returns {Promise<AudioBuffer>} Decoded AudioBuffer
 */
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

/**
 * Generate image from prompt
 * 
 * Generates an image using AI based on a text prompt, style, and aspect ratio
 * 
 * @param {string} prompt - Text description of the image to generate
 * @param {string} aspectRatio - Image aspect ratio (default: "16:9")
 * @param {string} style - Image style (default: "Photorealistic")
 * @returns {Promise<string|null>} Data URL of the generated image (format: "data:image/png;base64,...") or null on failure
 * 
 * @example
 * const imageUrl = await generateImage(
 *   "A futuristic cityscape at sunset",
 *   "16:9",
 *   "Photorealistic"
 * );
 * // Returns: "data:image/png;base64,iVBORw0KGgo..."
 */
export const generateImage = async (prompt, aspectRatio = "16:9", style = "Photorealistic") => {
  try {
    const response = await api.post('/api/media/images', {
      prompt,
      aspectRatio,
      style
    });
    return response.data.data?.imageUrl || response.data.imageUrl || null;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate image');
  }
};

/**
 * Edit existing image
 * 
 * Modifies an existing image based on a text prompt
 * 
 * @param {string} base64ImageData - Base64 encoded image data (with or without data URL prefix)
 * @param {string} mimeType - MIME type of the image (e.g., "image/png", "image/jpeg")
 * @param {string} prompt - Text description of desired modifications
 * @param {string} aspectRatio - Output aspect ratio (default: "16:9")
 * @returns {Promise<string|null>} Data URL of the edited image or null on failure
 * 
 * @example
 * const editedImage = await editImage(
 *   "data:image/png;base64,iVBORw0KGgo...",
 *   "image/png",
 *   "Add a sunset sky in the background",
 *   "16:9"
 * );
 */
export const editImage = async (base64ImageData, mimeType, prompt, aspectRatio = "16:9") => {
  try {
    // Extract base64 data if it includes data URL prefix
    const base64Data = base64ImageData.includes(',') 
      ? base64ImageData.split(',')[1] 
      : base64ImageData;

    const response = await api.post('/api/media/images/edit', {
      imageData: base64Data,
      mimeType,
      prompt,
      aspectRatio
    });
    return response.data.data?.imageUrl || response.data.imageUrl || null;
  } catch (error) {
    console.error('Error editing image:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to edit image');
  }
};

/**
 * Generate video from prompt
 * 
 * Generates a video using AI based on a text prompt and configuration
 * Note: Video generation is asynchronous and may take several minutes
 * 
 * @param {string} prompt - Text description of the video to generate
 * @param {string} style - Visual style (default: "Cinematic")
 * @param {string} resolution - Video resolution: "720p" or "1080p" (default: "720p")
 * @param {string} aspectRatio - Video aspect ratio: "16:9" or "9:16" (default: "16:9")
 * @param {string} duration - Video duration (default: "9s")
 * @param {string|null} startFrameBase64 - Optional base64 encoded starting frame image
 * @returns {Promise<string>} URL to download/generate the video
 * 
 * @example
 * const videoUrl = await generateVideo(
 *   "A drone flying over a mountain range",
 *   "Cinematic",
 *   "1080p",
 *   "16:9",
 *   "15s"
 * );
 */
export const generateVideo = async (
  prompt,
  style = 'Cinematic',
  resolution = '720p',
  aspectRatio = '16:9',
  duration = '9s',
  startFrameBase64 = null
) => {
  try {
    const payload = {
      prompt,
      style,
      resolution,
      aspectRatio,
      duration
    };

    if (startFrameBase64) {
      payload.startFrame = startFrameBase64.includes(',')
        ? startFrameBase64.split(',')[1]
        : startFrameBase64;
    }

    const response = await api.post('/api/media/videos', payload);
    return response.data.data?.videoUrl || response.data.videoUrl || null;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate video');
  }
};

/**
 * Generate audio from text (Text-to-Speech)
 * 
 * Converts text to speech using AI voice synthesis
 * 
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice name (default: "Kore")
 * @returns {Promise<string|null>} Data URL of the generated audio (format: "data:audio/pcm;base64,...") or null on failure
 * 
 * @example
 * const audioUrl = await generateAudio(
 *   "Welcome to our React Hooks tutorial",
 *   "Kore"
 * );
 * // Returns: "data:audio/pcm;base64,SUQzAwAAAAA..."
 */
export const generateAudio = async (text, voice = 'Kore') => {
  try {
    const response = await api.post('/api/media/audio', {
      text,
      voice
    });
    return response.data.data?.audioUrl || response.data.audioUrl || null;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate audio');
  }
};
