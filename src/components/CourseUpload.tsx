'use client'

import { useState } from 'react'
import { Upload, Loader2, Plus } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface CourseUploadProps {
  onUploadComplete: () => void
}

export default function CourseUpload({ onUploadComplete }: CourseUploadProps) {
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    version: ''
  })
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseData.title.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) throw new Error('Failed to create course')

      const course = await response.json()
      setSelectedCourseId(course.id)
      setCourseData({ title: '', description: '', version: '' })
      onUploadComplete()
      alert('Course created successfully!')
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  const uploadFile = async (file: File) => {
    if (!selectedCourseId) {
      alert('Please create a course first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload file')

      alert('File uploaded and processed successfully!')
      onUploadComplete()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0])
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: !selectedCourseId || uploading
  })

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Course</h2>
        <form onSubmit={createCourse} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g., Introduction to Python Programming"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Brief description of the course..."
            />
          </div>
          
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Version (optional)
            </label>
            <input
              id="version"
              type="text"
              value={courseData.version}
              onChange={(e) => setCourseData({ ...courseData, version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2024.1"
            />
          </div>
          
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Course
          </button>
        </form>
      </div>

      {selectedCourseId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Course Documents</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                <p className="text-gray-600">Processing document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop the file here...'
                    : 'Drag & drop a PDF or Word document here, or click to select'}
                </p>
                <p className="text-sm text-gray-500">Max file size: 50MB</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}