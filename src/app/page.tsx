'use client'

import { useState } from 'react'
import CourseList from '@/components/CourseList'
import SearchInterface from '@/components/SearchInterface'
import CourseUpload from '@/components/CourseUpload'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'manage'>('search')
  const [refreshCourses, setRefreshCourses] = useState(0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">AI Course Database</h1>
        
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Search Courses
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Courses
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'search' ? (
          <SearchInterface />
        ) : (
          <div className="space-y-8">
            <CourseUpload onUploadComplete={() => setRefreshCourses(prev => prev + 1)} />
            <CourseList key={refreshCourses} />
          </div>
        )}
      </div>
    </main>
  )
}