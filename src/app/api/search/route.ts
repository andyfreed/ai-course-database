import { NextRequest, NextResponse } from 'next/server'
import { createEmbedding, searchSimilarDocuments, searchSimilarQuestions } from '@/lib/embeddings'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, searchType = 'all', limit = 10 } = body
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    // Create embedding for the search query
    const queryEmbedding = await createEmbedding(query)
    
    let documentResults: any[] = []
    let questionResults: any[] = []
    
    // Search based on type
    if (searchType === 'all' || searchType === 'documents') {
      documentResults = (await searchSimilarDocuments(queryEmbedding, limit)) as any[]
    }
    
    if (searchType === 'all' || searchType === 'questions') {
      questionResults = (await searchSimilarQuestions(queryEmbedding, limit)) as any[]
    }
    
    // Combine and sort results
    const allResults = [
      ...documentResults.map(r => ({ ...r, type: 'document' })),
      ...questionResults.map(r => ({ ...r, type: 'question' }))
    ].sort((a, b) => a.distance - b.distance).slice(0, limit)
    
    // Generate AI response
    const context = allResults.map(r => {
      if (r.type === 'document') {
        return `Document: ${r.filename} (Course: ${r.courseTitle})\nContent: ${r.content}`
      } else {
        return `Question: ${r.question}\nAnswer: ${r.answer || 'No answer provided'}\nCourse: ${r.courseTitle}`
      }
    }).join('\n\n---\n\n')
    
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions about course content. Use the provided context to answer the user\'s query. Be concise and accurate.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuery: ${query}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
    
    return NextResponse.json({
      query,
      results: allResults,
      aiResponse: aiResponse.choices[0].message.content
    })
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 })
  }
}