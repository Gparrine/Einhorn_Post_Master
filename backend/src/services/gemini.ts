import { GoogleGenerativeAI } from '@google/generative-ai'
import { config, hasCredentials } from '../config.js'

export async function refineText(htmlContent: string, plainText: string): Promise<string> {
  if (config.demoMode && !hasCredentials('gemini')) {
    await delay(1500)
    return demoRefine(htmlContent, plainText)
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey)
  const model = genAI.getGenerativeModel({
    model: config.gemini.model,
    systemInstruction: config.gemini.systemPrompt,
    generationConfig: {
      temperature: config.gemini.temperature,
      maxOutputTokens: 8192,
    },
  })

  const result = await model.generateContent(buildUserPrompt(plainText, htmlContent))
  const text = result.response.text()

  if (!text?.trim()) {
    throw new Error('Gemini returned an empty response. Try again or shorten your draft.')
  }

  return normalizeHtmlOutput(text)
}

function buildUserPrompt(plainText: string, htmlContent: string): string {
  return `Refine this Einhorn martial arts club announcement.

Draft (plain text):
${plainText.trim()}

${htmlContent.trim() && htmlContent !== plainText ? `Original formatting (HTML reference):\n${htmlContent.trim()}` : ''}`
}

function normalizeHtmlOutput(text: string): string {
  let output = text.trim()

  // Strip markdown code fences if the model ignores instructions
  output = output.replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

  // Strip accidental preamble lines some models add
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
  return `<p><strong>Refined by AI (demo mode):</strong></p>${plainText
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p>${line.trim()}</p>`)
    .join('')}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
