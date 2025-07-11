'use client'

import { useState, useEffect } from 'react'
import { FileText, HelpCircle, Loader2 } from 'lucide-react'

interface Course {
  id: string
  title: string
  description?: string
  version?: string
  createdAt: string
  _count: {
    documents: number
    questions: number
  }
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      alert('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No courses found. Create your first course above.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Courses</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{course.title}</h3>
            {course.description && (
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
            )}
            {course.version && (
              <p className="text-sm text-gray-500 mb-4">Version: {course.version}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{course._count.documents} documents</span>
              </div>
              <div className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                <span>{course._count.questions} questions</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              Created: {new Date(course.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}