/**
 * AI Service Client
 *
 * Client for interacting with AI providers (OpenAI, Anthropic).
 * Handles GEO analysis, simulations, optimizations, and chat.
 */

import type { AIEngine, SubScores, Insight, Entity, ReasoningStep } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

/**
 * AI provider type
 */
export type AIProvider = 'openai' | 'anthropic';

/**
 * Content analysis request
 */
export interface AnalyzeContentRequest {
  content: string;
  url: string;
  title?: string;
  brandVoice?: {
    positioning?: string;
    differentiators?: string[];
    audience?: {
      demographic_context?: string;
      intent_signals?: string[];
    };
  };
}

/**
 * Content analysis response
 */
export interface AnalyzeContentResponse {
  overallScore: number;
  subScores: SubScores;
  insights: Insight[];
  perceptionTags: Record<string, number>;
  aiKeywords: string[];
  entities: Entity[];
}

/**
 * Simulation request
 */
export interface SimulateRequest {
  query: string;
  engine: AIEngine;
  brandContext?: {
    name: string;
    positioning?: string;
    differentiators?: string[];
  };
  contentContext?: string;
}

/**
 * Simulation response
 */
export interface SimulateResponse {
  aiResponse: string;
  brandMentioned: boolean;
  toneMatch: number;
  reasoningPath: ReasoningStep[];
  geoTip: string;
}

/**
 * Optimization request
 */
export interface OptimizeRequest {
  content: string;
  url: string;
  title?: string;
  options: {
    preserveTone: boolean;
    targetScore: number;
    focusAreas: Array<'entities' | 'structure' | 'clarity' | 'citations'>;
  };
  brandVoice?: {
    positioning?: string;
    differentiators?: string[];
    guardrails?: Array<{ avoid: string; reason: string }>;
  };
}

/**
 * Optimization response
 */
export interface OptimizeResponse {
  originalScore: number;
  optimizedScore: number;
  optimizedContent: string;
  changes: Array<{
    type: 'addition' | 'modification' | 'restructure';
    description: string;
    before?: string;
    after: string;
  }>;
  entities: Entity[];
  tips: string[];
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Chat request
 */
export interface ChatRequest {
  messages: ChatMessage[];
  siteContext?: {
    domain: string;
    currentPage?: string;
    selectedText?: string;
    recentAuditScore?: number;
  };
}

/**
 * Chat response (streaming)
 */
export interface ChatStreamEvent {
  type: 'start' | 'content' | 'done' | 'error';
  text?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Check if mock mode is enabled
 */
function isMockMode(): boolean {
  return process.env.MOCK_EXTERNAL_SERVICES === 'true';
}

/**
 * Get OpenAI API key
 */
function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key && !isMockMode()) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return key || 'mock-key';
}

/**
 * Get Anthropic API key
 */
function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key && !isMockMode()) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return key || 'mock-key';
}

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Mock analysis response
 */
function getMockAnalysisResponse(): AnalyzeContentResponse {
  return {
    overallScore: 72,
    subScores: {
      content_clarity: {
        score: 78,
        status: 'optimal',
        description: 'Content is well-structured with clear headings',
      },
      entity_coverage: {
        score: 65,
        status: 'improving',
        description: 'Good entity coverage but could include more specific terms',
      },
      answer_first: {
        score: 70,
        status: 'improving',
        description: 'Key information is present but not always at the beginning',
      },
      ai_readability: {
        score: 75,
        status: 'optimal',
        description: 'Content is easily parseable by AI systems',
      },
    },
    insights: [
      {
        type: 'structure',
        title: 'Add FAQ Section',
        description: 'Adding a FAQ section would improve AI discoverability',
        severity: 'info',
      },
      {
        type: 'entities',
        title: 'Missing Key Entities',
        description: 'Consider adding more specific product names and features',
        severity: 'warning',
      },
    ],
    perceptionTags: {
      'innovative': 75,
      'reliable': 82,
      'user-friendly': 68,
      'enterprise-ready': 55,
    },
    aiKeywords: ['cloud platform', 'data analytics', 'machine learning', 'automation'],
    entities: [
      { name: 'Cloud Computing', type: 'topic', status: 'detected' },
      { name: 'Data Analytics', type: 'topic', status: 'detected' },
      { name: 'Machine Learning', type: 'tech', status: 'weak' },
    ],
  };
}

/**
 * Mock simulation response
 */
function getMockSimulationResponse(query: string): SimulateResponse {
  return {
    aiResponse: `Based on my analysis, here are some recommendations for "${query}"...`,
    brandMentioned: Math.random() > 0.5,
    toneMatch: Math.floor(Math.random() * 30) + 60,
    reasoningPath: [
      {
        step: 'input_classification',
        description: 'Identified search intent as product comparison',
      },
      {
        step: 'knowledge_retrieval',
        description: 'Retrieved information from multiple sources',
      },
      {
        step: 'response_generation',
        description: 'Generated response based on relevance and authority',
      },
    ],
    geoTip: 'Consider adding more specific use-case content to improve AI recommendation likelihood.',
  };
}

/**
 * Mock optimization response
 */
function getMockOptimizationResponse(content: string): OptimizeResponse {
  return {
    originalScore: 62,
    optimizedScore: 85,
    optimizedContent: content + '\n\n## Frequently Asked Questions\n\n...',
    changes: [
      {
        type: 'restructure',
        description: 'Moved key answer to the beginning',
        after: 'The main benefit is...',
      },
      {
        type: 'addition',
        description: 'Added FAQ section',
        after: '## Frequently Asked Questions',
      },
    ],
    entities: [
      { name: 'Cloud Security', type: 'topic', status: 'detected' },
      { name: 'Zero Trust', type: 'concept', status: 'detected' },
    ],
    tips: [
      'Consider adding schema.org markup',
      'Link to authoritative sources',
    ],
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Analyzes content for GEO optimization
 *
 * @param request - Analysis request
 * @returns Analysis response with scores and insights
 */
export async function analyzeContent(
  request: AnalyzeContentRequest
): Promise<AnalyzeContentResponse> {
  if (isMockMode()) {
    console.log('[Mock] Analyzing content for:', request.url);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getMockAnalysisResponse();
  }

  const apiKey = getOpenAIKey();

  const systemPrompt = `You are a GEO (Generative Engine Optimization) expert. Analyze the provided content and return a JSON response with:
- overallScore: 0-100 score for AI visibility
- subScores: object with content_clarity, entity_coverage, answer_first, ai_readability
- insights: array of improvement suggestions
- perceptionTags: object mapping perception keywords to confidence scores
- aiKeywords: array of key terms AI would associate with this content
- entities: array of detected entities with name, type, and status`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this content from ${request.url}:\n\nTitle: ${request.title || 'N/A'}\n\nContent:\n${request.content}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Simulates an AI recommendation query
 *
 * @param request - Simulation request
 * @returns Simulation response
 */
export async function simulateRecommendation(
  request: SimulateRequest
): Promise<SimulateResponse> {
  if (isMockMode()) {
    console.log('[Mock] Simulating query:', request.query);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getMockSimulationResponse(request.query);
  }

  // Use the appropriate provider based on engine
  const isAnthropic = request.engine === 'claude-3';
  const apiKey = isAnthropic ? getAnthropicKey() : getOpenAIKey();

  const systemPrompt = `You are simulating how an AI assistant would respond to a user query. 
Consider the brand context provided and analyze:
1. Whether the brand would be mentioned in a natural response
2. How well the response tone matches the brand voice
3. The reasoning path an AI would take

Return a JSON response with: aiResponse, brandMentioned, toneMatch (0-100), reasoningPath (array of steps), geoTip`;

  if (isAnthropic) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Query: ${request.query}\n\nBrand Context: ${JSON.stringify(request.brandContext || {})}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } else {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Query: ${request.query}\n\nBrand Context: ${JSON.stringify(request.brandContext || {})}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

/**
 * Generates content optimization suggestions
 *
 * @param request - Optimization request
 * @returns Optimization response with improved content
 */
export async function generateOptimization(
  request: OptimizeRequest
): Promise<OptimizeResponse> {
  if (isMockMode()) {
    console.log('[Mock] Generating optimization for:', request.url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getMockOptimizationResponse(request.content);
  }

  const apiKey = getOpenAIKey();

  const systemPrompt = `You are a GEO content optimizer. Improve the provided content for AI visibility while:
- ${request.options.preserveTone ? 'Preserving the original tone' : 'Optimizing tone for clarity'}
- Targeting a GEO score of ${request.options.targetScore}
- Focusing on: ${request.options.focusAreas.join(', ')}

Return a JSON response with: originalScore, optimizedScore, optimizedContent, changes (array), entities (array), tips (array)`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `URL: ${request.url}\nTitle: ${request.title || 'N/A'}\n\nContent:\n${request.content}\n\nBrand Voice: ${JSON.stringify(request.brandVoice || {})}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Streams a GEO Assistant chat response
 *
 * @param request - Chat request
 * @returns AsyncGenerator yielding chat stream events
 */
export async function* chat(
  request: ChatRequest
): AsyncGenerator<ChatStreamEvent> {
  if (isMockMode()) {
    yield { type: 'start' };
    const mockResponse = 'Based on your GEO audit results, here are my recommendations...';
    for (const char of mockResponse) {
      yield { type: 'content', text: char };
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    yield { type: 'done', usage: { promptTokens: 100, completionTokens: 50 } };
    return;
  }

  const apiKey = getOpenAIKey();

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are the GEO Assistant, an expert in Generative Engine Optimization. 
Help users improve their content's visibility in AI-powered search and recommendation systems.
${request.siteContext ? `Context: Domain: ${request.siteContext.domain}, Current page: ${request.siteContext.currentPage || 'N/A'}` : ''}`,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [systemMessage, ...request.messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    yield { type: 'error', error: `OpenAI API error: ${error}` };
    return;
  }

  yield { type: 'start' };

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: 'error', error: 'No response body' };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done', usage: { promptTokens: 0, completionTokens: 0 } };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield { type: 'content', text: content };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: 'done', usage: { promptTokens: 0, completionTokens: 0 } };
}
