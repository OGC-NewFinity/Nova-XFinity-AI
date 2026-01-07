---
description: Full documentation of Nova‑XFinity AI tools, modules, and feature flows
status: Draft
lastUpdated: 2026-01-07
---

# AI Services and Tools

## Overview

The Nova‑XFinity AI tools layer provides a comprehensive suite of AI-powered capabilities that integrate seamlessly with the AI agent system. These tools abstract complex AI operations into user-friendly interfaces, enabling content creators, marketers, and developers to leverage advanced AI capabilities without direct provider interaction.

**Purpose:**
- Provide unified access to multi-provider AI capabilities
- Abstract provider complexity behind consistent interfaces
- Enable feature-specific optimizations and quota management
- Support extensible tool architecture for future capabilities

**Integration with AI Agent System:**
- Tools route requests through the provider manager (`services/ai/providerManager.js`)
- All tools leverage the unified `callAI()` function with automatic fallback
- Quota enforcement occurs at the tool level via middleware
- Response standardization ensures consistent output across providers

**Key Principles:**
- **Tool Abstraction:** Each tool provides a focused capability (e.g., SEO analysis, image generation)
- **Provider Agnostic:** Tools work with any configured provider (Gemini, OpenAI, Claude, Llama)
- **Quota Aware:** All tools respect subscription limits and token budgets
- **Extensible:** New tools can be added without modifying existing infrastructure

---

## Tool Categories

### Text Tools

Text generation and analysis tools for content creation, optimization, and enhancement.

#### Writer

**Purpose:** Generate SEO-optimized articles with structured metadata, outlines, and sections.

**Components:**
- `generateMetadata()` - Generate SEO metadata (title, description, focus keyphrase)
- `generateOutline()` - Create article structure with section headings
- `generateSection()` - Generate content for individual sections
- `generateCTA()` - Create call-to-action blocks

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/writer/Writer.js`
- Supporting Components:
  - `components/writer/MetadataCard.js`
  - `components/writer/SectionBlock.js`
  - `components/writer/CTABlock.js`

**Usage Flow:**
```
User Input (Topic, Keywords, Config)
  ↓
generateMetadata() → SEO Title, Description, Focus Keyphrase
  ↓
generateOutline() → Array of Section Headings
  ↓
generateSection() (per section) → HTML Content
  ↓
generateCTA() → Final CTA Block
  ↓
Complete Article with Metadata
```

**Example:**
```javascript
// From components/writer/Writer.js
const meta = await generateMetadata(
  config.topic, 
  config.keywords, 
  config.articleType,
  config.language,
  config.articleSize,
  config.pov,
  manualFocusKeyphrase,
  config.imageStyle,
  config.aspectRatio,
  config.sourceContext,
  config.category
);

const outline = await generateOutline(
  config.topic,
  [meta.focusKeyphrase, ...config.keywords],
  config.articleType,
  config.language,
  config.articleSize,
  config.pov,
  config.sourceContext,
  config.category
);

const content = await generateSection(
  sectionTitle,
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
```

**Provider Routing:**
- Primary: User-selected provider (Gemini/OpenAI/Claude/Llama)
- Fallback: Gemini (automatic on failure)

**Output Format:**
- Metadata: JSON object with `focusKeyphrase`, `seoTitle`, `slug`, `metaDescription`, `featuredImage`
- Outline: JSON array of section title strings
- Sections: Raw HTML content (no markdown fences)
- CTA: HTML block with branded styling

---

#### Summarizer

**Purpose:** Generate concise summaries of long-form content.

**Status:** Planned (referenced in Chrome extension plan, not yet implemented)

**Planned Implementation:**
- Summarize selected text via AI
- Multiple summary styles (brief, detailed, bullet points)
- Context-aware summarization with source preservation

**Planned File Paths:**
- Service: `services/geminiService.js` (new function: `summarizeContent()`)
- UI Component: `components/common/Summarizer.js` (new)

**Planned Usage:**
```javascript
// Future implementation
export const summarizeContent = async (content, style = 'brief') => {
  const systemPrompt = `Summarize the following content in ${style} style.`;
  const prompt = `Content to summarize:\n\n${content}`;
  return await callAI(prompt, systemPrompt, false);
};
```

---

#### SEO Analyzer

**Purpose:** Analyze content for SEO optimization and provide actionable recommendations.

**Components:**
- `analyzeSEO()` - Comprehensive SEO audit of content

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/writer/SEOAuditReport.js`

**Usage Flow:**
```
User Input (Content, Keywords)
  ↓
analyzeSEO() → SEO Metrics & Recommendations
  ↓
Display: Overall Score, Metrics, Suggestions
```

**Example:**
```javascript
// From components/writer/Writer.js
const result = await analyzeSEO(fullText, [
  metadata?.focusKeyphrase || '', 
  ...config.keywords
]);

// Result structure:
{
  overallScore: 85,
  metrics: {
    keyphraseDensity: 2.5,
    avgSentenceLength: 18,
    introPresence: true,
    passiveVoicePercentage: 12,
    subheadingDistribution: "Optimal H2/H3 structure"
  },
  readabilityLabel: "College Level",
  suggestions: [
    "Increase keyphrase density to 2.5-3%",
    "Add more internal linking opportunities",
    "Optimize meta description length"
  ]
}
```

**Provider Routing:**
- Primary: User-selected provider
- Fallback: Gemini

**Output Format:**
- JSON object with scoring, metrics, and actionable suggestions

---

#### CTA Generator

**Purpose:** Generate branded call-to-action blocks optimized for conversion.

**Components:**
- `generateCTA()` - Create CTA content with brand alignment

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/writer/CTABlock.js`

**Usage Flow:**
```
User Input (Topic, Keywords, Focus Keyphrase)
  ↓
generateCTA() → Branded CTA HTML Block
  ↓
Display in Editor with Copy Functionality
```

**Example:**
```javascript
// From components/writer/CTABlock.js
const result = await generateCTA(topic, keywords, focusKeyphrase);

// Returns: HTML string with branded CTA styling
```

**Provider Routing:**
- Primary: User-selected provider
- Fallback: Gemini

**Output Format:**
- Raw HTML string optimized for WordPress integration

---

#### Code Generator

**Purpose:** Generate code snippets, functions, and scripts based on natural language descriptions.

**Status:** Planned (referenced in planning docs, not yet implemented)

**Planned Implementation:**
- Code generation for multiple languages (JavaScript, Python, SQL, etc.)
- Syntax validation and formatting
- Context-aware code generation with best practices

**Planned File Paths:**
- Service: `services/geminiService.js` (new function: `generateCode()`)
- UI Component: `components/common/CodeGenerator.js` (new)

**Planned Usage:**
```javascript
// Future implementation
export const generateCode = async (description, language = 'javascript') => {
  const systemPrompt = `Generate ${language} code following best practices.`;
  const prompt = `Generate code for: ${description}`;
  return await callAI(prompt, systemPrompt, false);
};
```

---

### Media Tools

Media generation and editing tools for creating visual and audio content.

#### Image Generator

**Purpose:** Generate high-quality images from text prompts with style and aspect ratio control.

**Components:**
- `generateImage()` - Create images from text prompts
- `editImage()` - Modify existing images with AI

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/MediaHub.js`
- Inline Component: `components/writer/ImageBlock.js`

**Usage Flow:**
```
User Input (Prompt, Style, Aspect Ratio)
  ↓
generateImage() → Base64 Image Data URI
  ↓
Display Preview with Download Option
```

**Example:**
```javascript
// From services/geminiService.js
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
```

**Provider Routing:**
- Primary: Gemini (gemini-2.5-flash-image)
- Planned Fallback: Stability AI, Replicate

**Output Format:**
- Base64-encoded data URI: `data:image/png;base64,{data}`

**Supported Styles:**
- Photorealistic
- Cinematic
- Minimalist
- Abstract
- Technical Diagram
- Data Visualization

**Supported Aspect Ratios:**
- 1:1 (Square)
- 4:3 (Standard)
- 16:9 (Widescreen)
- 9:16 (Portrait)

---

#### Video Generator

**Purpose:** Generate short-form videos from text prompts with style, resolution, and duration control.

**Components:**
- `generateVideo()` - Create videos from prompts (async operation)

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/MediaHub.js`

**Usage Flow:**
```
User Input (Prompt, Style, Resolution, Aspect Ratio, Duration)
  ↓
generateVideo() → Async Operation Started
  ↓
Poll Operation Status (10s intervals)
  ↓
Operation Complete → Video Download URL
```

**Example:**
```javascript
// From services/geminiService.js
export const generateVideo = async (
  prompt, 
  style = 'Cinematic', 
  resolution = '720p', 
  aspectRatio = '16:9', 
  duration = '9s', 
  startFrameBase64 = null
) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
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
  
  // Poll until completion
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({operation});
    
    if (operation.error) {
      throw new Error(`Video Generation Operation Failed: ${operation.error.message}`);
    }
  }
  
  const videoMeta = operation.response?.generatedVideos?.[0]?.video;
  return `${videoMeta.uri}?key=${getApiKey()}`;
};
```

**Provider Routing:**
- Primary: Gemini Veo (veo-3.1-fast-generate-preview)
- Planned Fallback: Runway, Luma

**Output Format:**
- Signed URL with API key authentication
- Download link with expiration

**Supported Durations:**
- 5s
- 9s
- 25s

**Supported Resolutions:**
- 720p
- 1080p

---

#### Audio Generator

**Purpose:** Generate text-to-speech audio with voice selection.

**Components:**
- `generateAudio()` - Create TTS audio from text

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/MediaHub.js` (integrated with video generation)

**Usage Flow:**
```
User Input (Text, Voice Selection)
  ↓
generateAudio() → Base64 PCM Audio Data
  ↓
Decode & Play via Web Audio API
```

**Example:**
```javascript
// From services/geminiService.js
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
  return `data:audio/pcm;base64,${base64Audio}`;
};
```

**Provider Routing:**
- Primary: Gemini TTS (gemini-2.5-flash-preview-tts)
- Planned Fallback: ElevenLabs, Suno

**Output Format:**
- Base64-encoded PCM data: `data:audio/pcm;base64,{data}`
- Decoded via Web Audio API for playback

**Supported Voices:**
- Kore (default)
- Additional voices (planned)

---

#### Editor Suite

**Purpose:** AI-powered image editing and enhancement capabilities.

**Components:**
- `editImage()` - Modify existing images with AI instructions

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/MediaHub.js` (edit mode)

**Usage Flow:**
```
User Input (Source Image, Edit Instructions, Aspect Ratio)
  ↓
editImage() → Modified Base64 Image Data URI
  ↓
Display Preview with Download Option
```

**Example:**
```javascript
// From services/geminiService.js
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
```

**Provider Routing:**
- Primary: Gemini (gemini-2.5-flash-image)
- Planned Fallback: Stability AI, Replicate

**Output Format:**
- Base64-encoded data URI: `data:image/png;base64,{data}`

**Planned Features:**
- Background removal
- Style transfer
- Object removal/addition
- Color correction
- Resolution upscaling

---

### Research Tools

Research and analysis tools for content validation and competitive intelligence.

#### Grounded Search

**Purpose:** Perform deep research queries with real-time web grounding and source citations.

**Components:**
- `performResearch()` - Execute research queries with Google Search integration

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: `components/Research.js`

**Usage Flow:**
```
User Input (Research Query)
  ↓
performResearch() → Summary + Source Citations
  ↓
Display: Research Synthesis + Grounding Sources
```

**Example:**
```javascript
// From services/geminiService.js
export const performResearch = async (query) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Deep Research: ${query}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ 
      title: chunk.web?.title || 'Source', 
      uri: chunk.web?.uri || '' 
    })) || [];
  
  return { 
    summary: response.text, 
    sources 
  };
};
```

**Provider Routing:**
- Primary: Gemini (with googleSearch tool)
- Planned Fallback: OpenAI (with web search)

**Output Format:**
```javascript
{
  summary: "Research synthesis text...",
  sources: [
    { title: "Source Title", uri: "https://example.com" },
    // ... more sources
  ]
}
```

**Features:**
- Real-time web search integration
- Source citation extraction
- High-authority source filtering
- Competitive landscape analysis
- Market statistics retrieval

---

#### Competitor Analysis

**Purpose:** Analyze competitor content and strategies.

**Status:** Integrated within Research tool (not separate endpoint)

**Current Implementation:**
- Available via research queries with specific prompts
- Example: "Perform a brief competitive landscape analysis for: {topic}"

**Planned Enhancement:**
- Dedicated competitor analysis tool
- Automated competitor discovery
- Content gap analysis
- Keyword overlap detection

**Planned File Paths:**
- Service: `services/geminiService.js` (new function: `analyzeCompetitors()`)
- UI Component: `components/Research.js` (enhanced)

---

#### Plagiarism Checker

**Purpose:** Check content originality and detect potential plagiarism.

**Components:**
- `checkPlagiarism()` - Analyze content for originality

**File Paths:**
- Service: `services/geminiService.js`
- UI Component: Not yet implemented (planned for Writer component)

**Usage Flow:**
```
User Input (Content to Check)
  ↓
checkPlagiarism() → Originality Score + Matches
  ↓
Display: Plagiarism Report
```

**Example:**
```javascript
// From services/geminiService.js
export const checkPlagiarism = async (content) => {
  const text = await callAI(
    `Scan for originality: ${content.substring(0, 5000)}`, 
    SYSTEM_INSTRUCTIONS, 
    true
  );
  return JSON.parse(cleanAIOutput(text) || '{}');
};
```

**Provider Routing:**
- Primary: User-selected provider
- Fallback: Gemini

**Output Format:**
- JSON object with originality score and potential matches (planned)

**Planned Features:**
- Originality percentage
- Similar content detection
- Source attribution suggestions
- Citation recommendations

---

## Usage Flows

### End-to-End Article Generation Flow

**Complete workflow from topic to published article:**

```
1. User Input
   ├─ Topic: "AI Content Generation"
   ├─ Keywords: ["AI", "content", "automation"]
   ├─ Article Type: "How-To Guide"
   ├─ Size: "Medium (1,200-1,800 words)"
   └─ Source Context: (optional RSS feed data)

2. Metadata Generation
   ├─ generateMetadata() called
   ├─ Provider: Gemini (user-selected)
   ├─ Output: { focusKeyphrase, seoTitle, slug, metaDescription, featuredImage }
   └─ Display: MetadataCard component

3. Outline Generation
   ├─ generateOutline() called
   ├─ Provider: Gemini
   ├─ Output: ["Introduction", "Benefits", "Implementation", "Conclusion"]
   └─ Display: Section blocks created

4. Section Generation (per section)
   ├─ generateSection() called for each section
   ├─ Provider: Gemini
   ├─ Output: HTML content for each section
   └─ Display: SectionBlock components with content

5. Image Generation (optional, per section)
   ├─ generateImage() called inline
   ├─ Provider: Gemini Image
   ├─ Output: Base64 image data URI
   └─ Display: ImageBlock component

6. CTA Generation
   ├─ generateCTA() called
   ├─ Provider: Gemini
   ├─ Output: Branded CTA HTML block
   └─ Display: CTABlock component

7. SEO Analysis (optional)
   ├─ analyzeSEO() called
   ├─ Provider: Gemini
   ├─ Output: SEO metrics and suggestions
   └─ Display: SEOAuditReport component

8. Publishing
   ├─ WordPress integration via PublishModal
   ├─ Content formatted for WordPress
   └─ Published via WordPress REST API
```

**File References:**
- Entry Point: `components/writer/Writer.js` (handleStartGeneration)
- Services: `services/geminiService.js`
- Components: `components/writer/*.js`

---

### End-to-End Media Generation Flow

**Complete workflow for image/video/audio generation:**

```
1. User Input (Image Generation)
   ├─ Prompt: "Professional tech workspace"
   ├─ Style: "Photorealistic"
   ├─ Aspect Ratio: "16:9"
   └─ Mode: "generate"

2. Image Generation
   ├─ generateImage() called
   ├─ Provider: Gemini Image (gemini-2.5-flash-image)
   ├─ Processing: ~5-10 seconds
   ├─ Output: Base64 data URI
   └─ Display: Preview with download option

3. Image Editing (optional)
   ├─ User uploads source image
   ├─ Edit instructions: "Add blue accent colors"
   ├─ editImage() called
   ├─ Provider: Gemini Image
   ├─ Output: Modified base64 image
   └─ Display: Before/after comparison

4. Video Generation (alternative)
   ├─ Prompt: "Tech product reveal"
   ├─ Style: "Cinematic"
   ├─ Duration: "9s"
   ├─ Resolution: "720p"
   ├─ generateVideo() called
   ├─ Provider: Gemini Veo (veo-3.1-fast-generate-preview)
   ├─ Processing: Async operation (60-300 seconds)
   ├─ Polling: 10-second intervals
   ├─ Output: Signed video URL
   └─ Display: Video player with download

5. Audio Generation (optional, with video)
   ├─ Text: "Welcome to this presentation..."
   ├─ Voice: "Kore"
   ├─ generateAudio() called
   ├─ Provider: Gemini TTS
   ├─ Output: Base64 PCM audio
   ├─ Decode: Web Audio API
   └─ Playback: Auto-play or manual trigger
```

**File References:**
- Entry Point: `components/MediaHub.js`
- Services: `services/geminiService.js`
- Audio Utilities: `services/geminiService.js` (decodeBase64, decodeAudioData)

---

### End-to-End Research Flow

**Complete workflow for research queries:**

```
1. User Input
   ├─ Query: "Latest AI content generation trends 2024"
   └─ Quick Search Template: (optional)

2. Research Execution
   ├─ performResearch() called
   ├─ Provider: Gemini (with googleSearch tool)
   ├─ Processing: ~10-20 seconds
   ├─ Web Search: Google Search integration
   ├─ Source Extraction: Grounding metadata parsing
   └─ Synthesis: AI-generated summary

3. Output Processing
   ├─ Summary: Formatted text with citations
   ├─ Sources: Array of { title, uri } objects
   └─ Display: Research synthesis + source links

4. Integration (optional)
   ├─ Copy summary to clipboard
   ├─ Use in article source context
   └─ Export sources for citation
```

**File References:**
- Entry Point: `components/Research.js`
- Service: `services/geminiService.js` (performResearch)

---

## UI/UX Integration

### Writer Module

**Location:** Main application → Writer tab

**Components:**
- **Writer.js** - Main container component
  - Configuration panel (Layer 1)
  - Editor workspace (Layer 2)
  - Draft library management
- **MetadataCard.js** - SEO metadata display
- **SectionBlock.js** - Individual section editor
- **CTABlock.js** - Call-to-action generator
- **ImageBlock.js** - Inline image generation
- **SEOAuditReport.js** - SEO analysis results
- **PublishModal.js** - WordPress publishing interface

**Tool Access Points:**
- **Metadata Generation:** "Initialize Agent" button → Auto-generates metadata
- **Section Generation:** "Generate" button per section → Individual section content
- **Image Generation:** "FinityHub Media" button → Triggers all image blocks
- **SEO Analysis:** "SEO Audit" button → Analyzes complete article
- **CTA Generation:** "Generate Branded Conversion Block" button → Creates CTA

**File Path:** `components/writer/Writer.js`

---

### MediaHub Module

**Location:** Main application → MediaHub tab

**Components:**
- **MediaHub.js** - Main container with mode switching
  - Generate mode: Image generation
  - Edit mode: Image editing
  - Video mode: Video generation

**Tool Access Points:**
- **Image Generation:** Generate mode → Enter prompt → "Synthesize" button
- **Image Editing:** Edit mode → Upload image → Enter instructions → "Synthesize" button
- **Video Generation:** Video mode → Enter prompt → Configure duration/resolution → "Synthesize" button
- **Audio Generation:** Video mode → Enable "AI Voiceover Intro" toggle → Auto-generates with video

**Presets:**
- Article Graphic
- Marketing Banner
- Technical Diagram
- Data Graph
- Strategic Explainer (video)
- Technical Walkthrough (video)
- Product Reveal (video)

**File Path:** `components/MediaHub.js`

---

### Research Module

**Location:** Main application → Research tab

**Components:**
- **Research.js** - Main research interface
  - Search input with quick templates
  - Results display with source citations
  - Research impact metrics

**Tool Access Points:**
- **Research Query:** Enter query → "Deep Research" button
- **Quick Searches:** Template buttons (Market Statistics, Content Trends, Competitive Analysis, Latest News)

**File Path:** `components/Research.js`

---

### Dashboard Integration

**Location:** Main application → Dashboard

**Components:**
- Usage statistics display
- Quick access to recent tools
- Quota warnings and limits

**File Path:** `components/Dashboard.js`

---

## API Endpoints

### Article Endpoints

**Base Path:** `/api/articles`

| Method | Endpoint | Description | Quota Check | Usage Increment |
|--------|----------|-------------|-------------|-----------------|
| POST | `/api/articles` | Create new article | `articles` | `articlesGenerated` |
| POST | `/api/articles/:id/publish` | Publish to WordPress | `wordpress` | `articlesPublished` |

**File Path:** `backend/src/routes/articles.routes.js`

**Example Request:**
```javascript
POST /api/articles
Headers: { Authorization: "Bearer <token>" }
Body: {
  topic: "AI Content Generation",
  keywords: ["AI", "content"],
  articleType: "How-To Guide",
  // ... other config
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "article": { /* article data */ },
    "quota": {
      "remaining": 9,
      "limit": 10
    }
  }
}
```

---

### Media Endpoints

**Base Path:** `/api/media`

| Method | Endpoint | Description | Quota Check | Usage Increment |
|--------|----------|-------------|-------------|-----------------|
| POST | `/api/media/images` | Generate image | `images` | `imagesGenerated` |
| POST | `/api/media/videos` | Generate video | `videos` | `videosGenerated` |

**File Path:** `backend/src/routes/media.routes.js`

**Example Request:**
```javascript
POST /api/media/images
Headers: { Authorization: "Bearer <token>" }
Body: {
  prompt: "Professional tech workspace",
  style: "Photorealistic",
  aspectRatio: "16:9"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "data:image/png;base64,...",
    "quota": {
      "remaining": 24,
      "limit": 25
    }
  }
}
```

---

### Research Endpoints

**Base Path:** `/api/research`

| Method | Endpoint | Description | Quota Check | Usage Increment |
|--------|----------|-------------|-------------|-----------------|
| POST | `/api/research/query` | Execute research query | `research` | `researchQueries` |

**File Path:** `backend/src/routes/research.routes.js`

**Example Request:**
```javascript
POST /api/research/query
Headers: { Authorization: "Bearer <token>" }
Body: {
  query: "Latest AI content generation trends 2024"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Research synthesis text...",
    "sources": [
      { "title": "Source Title", "uri": "https://example.com" }
    ],
    "quota": {
      "remaining": 19,
      "limit": 20
    }
  }
}
```

---

### Authentication & Middleware

**Authentication:** All endpoints require JWT authentication via `authenticate` middleware

**Quota Enforcement:** All endpoints use `checkQuota` middleware before execution

**File Paths:**
- Auth: `backend/src/middleware/auth.middleware.js`
- Quota: `backend/src/middleware/quota.middleware.js`
- Usage: `backend/src/services/usage.service.js`

---

## Quota & Token Mapping

### Quota System (Current)

The current system uses operation-based quotas per subscription tier:

| Feature | FREE | PRO | ENTERPRISE |
|---------|-----|-----|------------|
| Articles | 10 | 100 | Unlimited |
| Images | 25 | 500 | Unlimited |
| Videos | 0 | 20 | 100 |
| Research | 20 | Unlimited | Unlimited |
| WordPress | 0 | 50 | Unlimited |

**Enforcement:**
- Middleware: `backend/src/middleware/quota.middleware.js`
- Service: `backend/src/services/usage.service.js`
- Frontend: `utils/quotaChecker.js`

---

### Token Economy (Planned)

The token economy system maps operations to token costs:

| Operation | Base Cost (Tokens) | Quality Multiplier | FREE | PRO | ENTERPRISE |
|-----------|-------------------|-------------------|------|-----|------------|
| **Text Generation** | | | | | |
| SEO Article (500-1000 words) | 10 | 1x / 1.5x / 2x | 10 | 15 | 20 |
| Article Section (200-500 words) | 5 | 1x / 1.5x / 2x | 5 | 7.5 | 10 |
| Metadata Generation | 2 | 1x | 2 | 2 | 2 |
| CTA Block | 1 | 1x | 1 | 1 | 1 |
| Outline Generation | 3 | 1x / 1.5x / 2x | 3 | 4.5 | 6 |
| **Image Generation** | | | | | |
| Single Image (Standard) | 8 | 1x | 8 | - | - |
| Single Image (High Quality) | 12 | 1x | - | 12 | - |
| Single Image (Highest Quality) | 20 | 1x | - | - | 20 |
| Image Edit/Enhancement | 6 | 1x / 1.5x / 2x | 6 | 9 | 12 |
| **Video Generation** | | | | | |
| Video Clip (10-30s) | 50 | 1x / 1.5x / 2x | - | 75 | 100 |
| Video Clip (30-60s) | 100 | 1x / 1.5x / 2x | - | 150 | 200 |
| **Research & Analysis** | | | | | |
| Research Query | 5 | 1x | 5 | 5 | 5 |
| SEO Analysis | 8 | 1x / 1.5x / 2x | 8 | 12 | 16 |
| Plagiarism Check | 3 | 1x | 3 | 3 | 3 |
| **WordPress Integration** | | | | | |
| WordPress Publication | 2 | 1x | - | 2 | 2 |

**Monthly Token Allocations:**
- FREE: 200 tokens
- PRO: 3,000 tokens
- ENTERPRISE: 15,000 tokens

**Token Rollover:**
- PRO: 10% (max 300 tokens)
- ENTERPRISE: 20% (max 3,000 tokens)
- FREE: No rollover

**Detailed Documentation:** See [`token-economy.md`](./token-economy.md)

---

## Planned Tools

### Summarizer

**Status:** Planned

**Description:** Generate concise summaries of long-form content with multiple style options.

**Planned Features:**
- Brief summaries (1-2 sentences)
- Detailed summaries (paragraph format)
- Bullet point summaries
- Context-aware summarization
- Source preservation

**Planned Implementation:**
- Service function: `summarizeContent(content, style)`
- UI component: `components/common/Summarizer.js`
- Integration: Writer component, Chrome extension

**Estimated Release:** Q2 2026

---

### Code Generator

**Status:** Planned

**Description:** Generate code snippets, functions, and scripts from natural language descriptions.

**Planned Features:**
- Multi-language support (JavaScript, Python, SQL, etc.)
- Syntax validation and formatting
- Best practices enforcement
- Context-aware code generation
- Code explanation and documentation

**Planned Implementation:**
- Service function: `generateCode(description, language, context)`
- UI component: `components/common/CodeGenerator.js`
- Integration: Standalone tool, Writer component integration

**Estimated Release:** Q3 2026

---

### Competitor Analysis Tool

**Status:** Planned (enhancement of Research tool)

**Description:** Dedicated tool for competitive analysis with automated competitor discovery.

**Planned Features:**
- Automated competitor discovery
- Content gap analysis
- Keyword overlap detection
- Performance benchmarking
- Strategy recommendations

**Planned Implementation:**
- Service function: `analyzeCompetitors(topic, keywords)`
- UI component: Enhanced `components/Research.js`
- Integration: Research module

**Estimated Release:** Q2 2026

---

### Advanced Image Editor

**Status:** Planned (enhancement of Editor Suite)

**Description:** Advanced image editing capabilities beyond basic modifications.

**Planned Features:**
- Background removal
- Style transfer
- Object removal/addition
- Color correction
- Resolution upscaling
- Batch processing

**Planned Implementation:**
- Service functions: `removeBackground()`, `transferStyle()`, `upscaleImage()`
- UI component: Enhanced `components/MediaHub.js`
- Integration: MediaHub edit mode

**Estimated Release:** Q3 2026

---

### Content Translator

**Status:** Planned

**Description:** Translate content between multiple languages while preserving SEO optimization.

**Planned Features:**
- Multi-language translation
- SEO-aware translation (preserves keywords)
- Tone preservation
- Cultural adaptation
- Batch translation

**Planned Implementation:**
- Service function: `translateContent(content, targetLanguage, preserveSEO)`
- UI component: `components/common/Translator.js`
- Integration: Writer component, API endpoint

**Estimated Release:** Q4 2026

---

## Related Documentation

### Core Documentation

- **[AI Service Flow](./ai-service-flow.md)** - Complete lifecycle of AI service calls, from user input through provider routing to response delivery
- **[Token Economy](./token-economy.md)** - Detailed token system, pricing logic, usage metering, and Web3 extensions
- **[AI Agent Extension](./ai-agent-extension.md)** - Extending the AI agent with new providers and capabilities

### Integration Guides

- **[API Key Integration Guide](../integrations/api-key-integration-guide.md)** - API key management and integration guide (planned)
- **[WordPress Plugin Developer Guide](../integrations/wordpress-plugin-developer-guide.md)** - WordPress plugin integration and API endpoints

### Development Documentation

- **[Debugging](../development/debugging.md)** - Troubleshooting AI service issues and provider errors
- **[Setup](../development/setup.md)** - Development environment setup and configuration
- **[Docker Containerization](../development/docker-containerization-system.md)** - Docker setup and container management

### Architecture Documentation

- **[Backend Architecture](../architecture/backend-architecture.md)** - Overall backend system architecture
- **[Provider Integration](../architecture/provider-integration.md)** - Provider-specific integration details
- **[Security Model](../architecture/security-model.md)** - Security considerations and API key management
- **[Subscriptions and Billing](../architecture/subscriptions-and-billing.md)** - Subscription tiers, billing flows, payment providers

---

## Code References

### Core Service Files

- `services/geminiService.js` - Main AI service implementation with all tool functions
- `services/ai/providerManager.js` - Provider configuration management
- `utils/inputOptimizer.js` - Input sanitization and optimization
- `utils/outputOptimizer.js` - Output cleaning and formatting
- `constants.js` - System instructions and provider options

### Frontend Components

**Writer Module:**
- `components/writer/Writer.js` - Main article generation UI
- `components/writer/MetadataCard.js` - SEO metadata display
- `components/writer/SectionBlock.js` - Section editor
- `components/writer/CTABlock.js` - CTA generator UI
- `components/writer/ImageBlock.js` - Inline image generation
- `components/writer/SEOAuditReport.js` - SEO analysis results
- `components/writer/PublishModal.js` - WordPress publishing

**Media Module:**
- `components/MediaHub.js` - Media generation UI

**Research Module:**
- `components/Research.js` - Research query UI

**Common Components:**
- `components/common/QuotaGuard.js` - Quota enforcement UI
- `components/common/FeatureLock.js` - Feature access control

### Backend Routes

- `backend/src/routes/articles.routes.js` - Article generation endpoints
- `backend/src/routes/media.routes.js` - Media generation endpoints
- `backend/src/routes/research.routes.js` - Research query endpoints

### Middleware & Services

- `backend/src/middleware/quota.middleware.js` - Quota enforcement
- `backend/src/middleware/auth.middleware.js` - Authentication
- `backend/src/services/usage.service.js` - Usage tracking
- `utils/quotaChecker.js` - Frontend quota checking utilities

---

**Last Updated:** 2026-01-07  
**Status:** Draft  
**Maintainer:** Nova‑XFinity Development Team
