'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'document' | 'question'
  content: string
  courseTitle: string
  filename?: string
  question?: string
  answer?: string
  distance: number
}

export default function SearchInterface() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setResults(data.results)
      setAiResponse(data.aiResponse)
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to perform search')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course content, exam questions, or ask anything..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {aiResponse && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">AI Response</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Search Results</h3>
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  result.type === 'document' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {result.type === 'document' ? 'Document' : 'Question'}
                </span>
                <span className="text-sm text-gray-500">
                  Course: {result.courseTitle}
                </span>
              </div>
              
              {result.type === 'document' ? (
                <div>
                  <p className="font-medium text-gray-900 mb-1">{result.filename}</p>
                  <p className="text-gray-600 text-sm line-clamp-3">{result.content}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900 mb-1">Q: {result.question}</p>
                  {result.answer && (
                    <p className="text-gray-600 text-sm">A: {result.answer}</p>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Relevance score: {(1 - result.distance).toFixed(3)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}