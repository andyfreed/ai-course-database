export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = (await import('pdf-parse')).default
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error extracting text from DOCX:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const lowerFileType = fileType.toLowerCase()
  
  if (lowerFileType === 'pdf' || lowerFileType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  } else if (
    lowerFileType === 'docx' ||
    lowerFileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDocx(buffer)
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
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