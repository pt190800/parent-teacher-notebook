'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Student, DailyNote, NoteFilters } from '@/types'
import { 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  MessageCircle, 
  FileText, 
  Clock,
  User,
  BookOpen,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { downloadNotesPDF, PDFExportOptions } from '@/lib/pdf-generator'

export function ParentDashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NoteFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchStudents()
  }, [user])

  useEffect(() => {
    if (selectedStudent) {
      fetchNotes(selectedStudent.id)
    }
  }, [selectedStudent, filters])

  const fetchStudents = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(*, school:schools(*))
        `)
        .eq('parent_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      setStudents(data || [])
      if (data && data.length > 0) {
        setSelectedStudent(data[0])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async (studentId: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('daily_notes')
        .select(`
          *,
          teacher:users(first_name, last_name),
          attachments:note_attachments(*),
          comments:note_comments(*, user:users(first_name, last_name))
        `)
        .eq('student_id', studentId)
        .eq('status', 'published')
        .order('note_date', { ascending: false })

      // Apply filters
      if (filters.date_from) {
        query = query.gte('note_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('note_date', filters.date_to)
      }
      if (filters.keyword) {
        query = query.or(`title.ilike.%${filters.keyword}%,content.ilike.%${filters.keyword}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<NoteFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      note.title?.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.teacher?.first_name?.toLowerCase().includes(searchLower) ||
      note.teacher?.last_name?.toLowerCase().includes(searchLower)
    )
  })

  const exportToPDF = async () => {
    if (!selectedStudent) return

    try {
      const exportOptions: PDFExportOptions = {
        student: selectedStudent,
        notes: filteredNotes,
        dateFrom: filters.date_from,
        dateTo: filters.date_to,
        includeComments: true,
        includeAttachments: true,
      }

      await downloadNotesPDF(exportOptions)
      toast.success('PDF exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export PDF')
    }
  }

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Students Found</h2>
          <p className="text-gray-600">Contact your school administrator to add your child to the system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Students */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Children</h3>
              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStudent?.id === student.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.class?.name} - {student.class?.school?.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Notes */}
          <div className="lg:col-span-3">
            {selectedStudent && (
              <>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search notes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        placeholder="From date"
                        value={filters.date_from || ''}
                        onChange={(e) => handleFilterChange({ date_from: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        placeholder="To date"
                        value={filters.date_to || ''}
                        onChange={(e) => handleFilterChange({ date_to: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Timeline */}
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading notes...</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
                      <p className="text-gray-600">
                        {searchTerm || filters.date_from || filters.date_to
                          ? 'No notes match your current filters.'
                          : 'No notes have been posted yet.'}
                      </p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {note.title || 'Daily Note'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(note.note_date), 'MMMM d, yyyy')}
                              <Clock className="h-4 w-4 ml-4 mr-1" />
                              {format(new Date(note.created_at), 'h:mm a')}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            By {note.teacher?.first_name} {note.teacher?.last_name}
                          </div>
                        </div>

                        <div className="prose max-w-none mb-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        </div>

                        {/* Attachments */}
                        {note.attachments && note.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                            <div className="flex flex-wrap gap-2">
                              {note.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  {attachment.file_name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Comments ({note.comments?.length || 0})
                          </h4>
                          <div className="space-y-3">
                            {note.comments?.map((comment) => (
                              <div key={comment.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">
                                      {comment.user?.first_name} {comment.user?.last_name}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}