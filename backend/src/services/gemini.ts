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
  })

  const result = await model.generateContent(
    `Please refine this martial arts club announcement:\n\n${plainText}\n\nOriginal HTML (for reference):\n${htmlContent}`,
  )

  const text = result.response.text()

  if (text.includes('<')) {
    return text.replace(/^```html?\n?|\n?```$/g, '').trim()
  }

  return text
    .split('\n\n')
    .filter(Boolean)
    .map((p) => `<p>${p.trim()}</p>`)
    .join('')
}

function demoRefine(_html: string, plainText: string): string {
  return `<p><strong>✨ Refined by AI (demo mode):</strong></p>${plainText
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p>${line.trim()}</p>`)
    .join('')}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
