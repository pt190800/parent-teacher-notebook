'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Student, DailyNote, Class } from '@/types'
import { 
  Plus, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock,
  Edit,
  MessageCircle,
  FileText,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { NoteFormModal } from './NoteFormModal'

export function TeacherDashboard() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [recentNotes, setRecentNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTeacherData()
  }, [user])

  const fetchTeacherData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch classes assigned to this teacher
      const { data: teacherClasses, error: classesError } = await supabase
        .from('teacher_classes')
        .select(`
          class:classes(
            *,
            school:schools(*)
          )
        `)
        .eq('teacher_id', user.id)

      if (classesError) throw classesError

      const classData = teacherClasses?.map(tc => tc.class).filter(Boolean) || []
      setClasses(classData)

      if (classData.length > 0) {
        setSelectedClass(classData[0])
        await fetchStudentsForClass(classData[0].id)
      }

      // Fetch recent notes
      await fetchRecentNotes()

    } catch (error) {
      console.error('Error fetching teacher data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsForClass = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(*),
          parent:users(first_name, last_name, phone_number)
        `)
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    }
  }

  const fetchRecentNotes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('daily_notes')
        .select(`
          *,
          student:students(first_name, last_name),
          attachments:note_attachments(*),
          comments:note_comments(*, user:users(first_name, last_name))
        `)
        .eq('teacher_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentNotes(data || [])
    } catch (error) {
      console.error('Error fetching recent notes:', error)
    }
  }

  const handleClassChange = (classId: string) => {
    const selectedClassData = classes.find(c => c.id === classId)
    if (selectedClassData) {
      setSelectedClass(selectedClassData)
      fetchStudentsForClass(classId)
    }
  }

  const handleCreateNote = (student: Student) => {
    setSelectedStudent(student)
    setShowNoteForm(true)
  }

  const handleNoteCreated = () => {
    setShowNoteForm(false)
    setSelectedStudent(null)
    fetchRecentNotes()
    toast.success('Note created successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} • {students.length} students
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selector */}
        {classes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Class</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => handleClassChange(classItem.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedClass?.id === classItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{classItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {classItem.grade_level} • {classItem.school?.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedClass && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Students in {selectedClass.name}
                  </h3>
                </div>
                <div className="p-6">
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No students in this class yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Student ID: {student.student_id || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCreateNote(student)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Note
                            </button>
                          </div>
                          {student.parent && (
                            <div className="text-sm text-gray-600">
                              Parent: {student.parent.first_name} {student.parent.last_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Notes */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                </div>
                <div className="p-6">
                  {recentNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notes yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentNotes.map((note) => (
                        <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {note.student?.first_name} {note.student?.last_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {format(new Date(note.note_date), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {note.title || 'Daily Note'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(note.created_at), 'h:mm a')}
                            {note.comments && note.comments.length > 0 && (
                              <>
                                <MessageCircle className="h-3 w-3 ml-3 mr-1" />
                                {note.comments.length}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {classes.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Classes Assigned</h2>
            <p className="text-gray-600">Contact your administrator to get assigned to classes.</p>
          </div>
        )}
      </div>

      {/* Note Form Modal */}
      {showNoteForm && selectedStudent && (
        <NoteFormModal
          student={selectedStudent}
          onClose={() => {
            setShowNoteForm(false)
            setSelectedStudent(null)
          }}
          onSuccess={handleNoteCreated}
        />
      )}
    </div>
  )
}