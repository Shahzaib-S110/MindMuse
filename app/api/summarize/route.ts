// /app/api/summarize/route.ts

import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Stored in .env.local
})

export async function POST(req: Request) {
  const { content } = await req.json()

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following note in 2-3 lines.' },
        { role: 'user', content },
      ],
    })

    const summary = chat.choices[0]?.message?.content?.trim()
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('OpenAI Error:', error)
    return NextResponse.json({ summary: '' }, { status: 500 })
  }
}
