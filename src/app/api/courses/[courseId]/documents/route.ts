import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { extractTextFromFile } from '@/lib/file-processors'
import { createAndStoreDocumentEmbeddings } from '@/lib/embeddings'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const fileType = file.type
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and DOCX files are supported.' }, { status: 400 })
    }
    
    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800') // 50MB default
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds limit' }, { status: 400 })
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Extract text from file
    const extractedText = await extractTextFromFile(buffer, fileType)
    
    // Upload file to Supabase Storage
    const fileName = `${courseId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('course-documents')
      .upload(fileName, buffer, {
        contentType: fileType,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('course-documents')
      .getPublicUrl(fileName)
    
    // Create document record
    const document = await prisma.document.create({
      data: {
        courseId: courseId,
        filename: file.name,
        fileType: fileType === 'application/pdf' ? 'pdf' : 'docx',
        fileUrl: publicUrl,
        content: extractedText,
        metadata: {
          originalSize: file.size,
          uploadPath: fileName
        }
      }
    })
    
    // Create embeddings for document
    await createAndStoreDocumentEmbeddings(document.id, extractedText)
    
    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      document
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 })
  }
}