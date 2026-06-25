import { GoogleGenAI } from '@google/genai'
import { config, hasCredentials } from '../config.js'

export async function refineText(htmlContent: string, plainText: string): Promise<string> {
  if (config.demoMode && !hasCredentials('gemini')) {
    await delay(1500)
    return demoRefine(htmlContent, plainText)
  }

  const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey })

  const response = await ai.models.generateContent({
    model: config.gemini.model,
    contents: buildUserPrompt(plainText, htmlContent),
    config: {
      systemInstruction: config.gemini.systemPrompt,
      tools: [{ googleSearch: {} }],
      temperature: config.gemini.temperature,
      maxOutputTokens: 8192,
    },
  })

  const text = response.text

  if (!text?.trim()) {
    throw new Error('Gemini returned an empty response. Try again or shorten your draft.')
  }

  return normalizeHtmlOutput(text)
}

function buildUserPrompt(plainText: string, htmlContent: string): string {
  return `Refine this Einhorn martial arts club announcement.

Before writing the final post, you MUST use Google Search twice:
1. Search for a real historical fact about hydration, water, moats, sieges, ancient beverages, or warriors on campaign — then adapt it into a fresh hydration reminder. Do NOT reuse any example from the system instructions.
2. Search for a real proverb, idiom, or quote — then adapt it into a fresh closing quip addressed to "Seeker" with sword/HEMA flavor. Do NOT reuse any example from the system instructions.

Each refinement must use newly searched material. Never copy the Cornwall siege, Posca, "swinging sword gathers no rust," or any other example verbatim or paraphrased.

Draft (plain text):
${plainText.trim()}

${htmlContent.trim() && htmlContent !== plainText ? `Original formatting (HTML reference):\n${htmlContent.trim()}` : ''}`
}

function normalizeHtmlOutput(text: string): string {
  let output = text.trim()

  output = output.replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

  if (!output.startsWith('<')) {
    const htmlStart = output.indexOf('<p>')
    if (htmlStart > 0) {
      output = output.slice(htmlStart)
    }
  }

  if (output.includes('<')) {
    return output
  }

  return output
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function demoRefine(_html: string, plainText: string): string {
  return `<p><strong>Refined by AI (demo mode — web search disabled):</strong></p>${plainText
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p>${line.trim()}</p>`)
    .join('')}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
