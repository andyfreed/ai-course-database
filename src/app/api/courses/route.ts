import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAndStoreCourseEmbedding } from '@/lib/embeddings'

export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        documents: {
          select: {
            id: true,
            filename: true,
            fileType: true,
            createdAt: true
          }
        },
        questions: {
          select: {
            id: true,
            type: true,
            difficulty: true
          }
        },
        _count: {
          select: {
            documents: true,
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, version } = body
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    const course = await prisma.course.create({
      data: {
        title,
        description,
        version
      }
    })
    
    // Create embedding for course title and description
    const embeddingContent = `${title} ${description || ''}`
    await createAndStoreCourseEmbedding(course.id, embeddingContent)
    
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}