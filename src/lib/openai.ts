import OpenAI from 'openai'
import { OpenAIEmbeddings } from "@langchain/openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
})

export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  model: "text-embedding-3-small",
})