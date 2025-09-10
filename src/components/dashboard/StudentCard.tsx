'use client'

import { Student } from '@/types'
import { format } from 'date-fns'
import { 
  Users, 
  Plus, 
  Calendar,
  User,
  MessageSquare
} from 'lucide-react'

interface StudentCardProps {
  student: Student
  onAddNote: () => void
}

export function StudentCard({ student, onAddNote }: StudentCardProps) {
  const age = new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {student.first_name} {student.last_name}
            </h3>
            <p className="text-sm text-gray-600">
              Age {age} • {student.class?.name}
            </p>
          </div>
        </div>
        <button
          onClick={onAddNote}
          className="btn-primary flex items-center text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Parent: {student.parent?.full_name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Student ID: {student.student_id}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Last updated: {format(new Date(student.updated_at), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>
    </div>
  )
}
