// /app/api/summarize/route.ts

import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

// Ensure the API key is available
const apiKey = process.env.OPENAI_API_KEY || ''

if (!apiKey) {
  console.error('❌ Missing OPENAI_API_KEY in environment variables!')
}

const openai = new OpenAI({ apiKey })

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid note content' }, { status: 400 })
    }

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following note in 2-3 lines.' },
        { role: 'user', content },
      ],
    })

    const summary = chat.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('❌ OpenAI Error:', error)
    return NextResponse.json({ summary: '', error: 'Internal server error' }, { status: 500 })
  }
}
