import { embeddings } from './openai'
import { prisma } from './prisma'

export async function createEmbedding(text: string): Promise<number[]> {
  const embedding = await embeddings.embedQuery(text)
  return embedding
}

export async function createAndStoreDocumentEmbeddings(
  documentId: string,
  text: string,
  chunkSize: number = 1000
) {
  const chunks = chunkText(text, chunkSize)
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await createEmbedding(chunk)
    
    await prisma.$executeRaw`
      INSERT INTO "DocumentEmbedding" (id, "documentId", content, embedding, "pageNumber", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${documentId},
        ${chunk},
        ${embedding}::vector,
        ${i + 1},
        NOW()
      )
    `
  }
}

export async function createAndStoreCourseEmbedding(
  courseId: string,
  content: string,
  metadata?: any
) {
  const embedding = await createEmbedding(content)
  
  await prisma.$executeRaw`
    INSERT INTO "CourseEmbedding" (id, "courseId", content, embedding, metadata, "createdAt")
    VALUES (
      gen_random_uuid(),
      ${courseId},
      ${content},
      ${embedding}::vector,
      ${metadata || null}::jsonb,
      NOW()
    )
  `
}

export async function createAndStoreQuestionEmbedding(
  questionId: string,
  content: string,
  metadata?: any
) {
  const embedding = await createEmbedding(content)
  
  await prisma.$executeRaw`
    INSERT INTO "QuestionEmbedding" (id, "questionId", content, embedding, metadata, "createdAt")
    VALUES (
      gen_random_uuid(),
      ${questionId},
      ${content},
      ${embedding}::vector,
      ${metadata || null}::jsonb,
      NOW()
    )
  `
}

export async function searchSimilarDocuments(
  queryEmbedding: number[],
  limit: number = 10
) {
  const results = await prisma.$queryRaw`
    SELECT 
      de.*,
      d.filename,
      d."courseId",
      c.title as "courseTitle",
      de.embedding <=> ${queryEmbedding}::vector as distance
    FROM "DocumentEmbedding" de
    JOIN "Document" d ON de."documentId" = d.id
    JOIN "Course" c ON d."courseId" = c.id
    ORDER BY distance
    LIMIT ${limit}
  `
  
  return results
}

export async function searchSimilarQuestions(
  queryEmbedding: number[],
  limit: number = 10
) {
  const results = await prisma.$queryRaw`
    SELECT 
      qe.*,
      q.question,
      q.answer,
      q.type,
      c.title as "courseTitle",
      qe.embedding <=> ${queryEmbedding}::vector as distance
    FROM "QuestionEmbedding" qe
    JOIN "ExamQuestion" q ON qe."questionId" = q.id
    JOIN "Course" c ON q."courseId" = c.id
    ORDER BY distance
    LIMIT ${limit}
  `
  
  return results
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = start + chunkSize
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start = end - overlap
  }
  
  return chunks
}