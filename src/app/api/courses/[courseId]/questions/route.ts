import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAndStoreQuestionEmbedding } from '@/lib/embeddings'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const questions = await prisma.examQuestion.findMany({
      where: {
        courseId: courseId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const { question, answer, options, type, difficulty, chapter } = body
    
    if (!question || !type) {
      return NextResponse.json({ error: 'Question and type are required' }, { status: 400 })
    }
    
    const examQuestion = await prisma.examQuestion.create({
      data: {
        courseId: courseId,
        question,
        answer,
        options,
        type,
        difficulty,
        chapter
      }
    })
    
    // Create embedding for question
    const embeddingContent = `${question} ${answer || ''}`
    await createAndStoreQuestionEmbedding(examQuestion.id, embeddingContent)
    
    return NextResponse.json(examQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { questions } = body
    
    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions must be an array' }, { status: 400 })
    }
    
    const createdQuestions = await Promise.all(
      questions.map(async (q) => {
        const examQuestion = await prisma.examQuestion.create({
          data: {
            courseId: q.courseId,
            question: q.question,
            answer: q.answer,
            options: q.options,
            type: q.type,
            difficulty: q.difficulty,
            chapter: q.chapter
          }
        })
        
        // Create embedding
        const embeddingContent = `${q.question} ${q.answer || ''}`
        await createAndStoreQuestionEmbedding(examQuestion.id, embeddingContent)
        
        return examQuestion
      })
    )
    
    return NextResponse.json({
      message: 'Questions imported successfully',
      count: createdQuestions.length
    })
  } catch (error) {
    console.error('Error importing questions:', error)
    return NextResponse.json({ error: 'Failed to import questions' }, { status: 500 })
  }
}