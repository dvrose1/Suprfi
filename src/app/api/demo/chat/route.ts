// ABOUTME: API route for investor demo chat with Claude
// ABOUTME: Handles technician agent conversation using client-provided API key

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant.',
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })
    
    const textContent = response.content.find(c => c.type === 'text')
    const content = textContent && textContent.type === 'text' ? textContent.text : ''
    
    return NextResponse.json({ content })
    
  } catch (error) {
    console.error('Demo chat API error:', error)
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
