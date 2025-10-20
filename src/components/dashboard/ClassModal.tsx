'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { School, User } from '@/types'
import { X, Loader2, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClassModalProps {
  schools: School[]
  teachers: User[]
  onClose: () => void
  onClassAdded: () => void
}

interface ClassFormData {
  name: string
  school_id: string
  teacher_id: string
  grade_level: string
  academic_year: string
}

export function ClassModal({ schools, teachers, onClose, onClassAdded }: ClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>({
    defaultValues: {
      academic_year: '2024-2025',
    }
  })

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('classes')
        .insert(data as any)

      if (error) throw error

      toast.success('Class added successfully!')
      onClassAdded()
    } catch (error) {
      console.error('Error adding class:', error)
      toast.error('Failed to add class. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add Class</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <input
                {...register('name', {
                  required: 'Class name is required',
                  minLength: {
                    value: 2,
                    message: 'Class name must be at least 2 characters',
                  },
                })}
                type="text"
                id="name"
                className="input-field"
                placeholder="e.g., Grade 3A"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                {...register('school_id', {
                  required: 'Please select a school',
                })}
                id="school_id"
                className="input-field"
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              {errors.school_id && (
                <p className="mt-1 text-sm text-red-600">{errors.school_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-2">
                Teacher
              </label>
              <select
                {...register('teacher_id', {
                  required: 'Please select a teacher',
                })}
                id="teacher_id"
                className="input-field"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
              {errors.teacher_id && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                {...register('grade_level', {
                  required: 'Please select a grade level',
                })}
                id="grade_level"
                className="input-field"
              >
                <option value="">Select grade level</option>
                {['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
              {errors.grade_level && (
                <p className="mt-1 text-sm text-red-600">{errors.grade_level.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                {...register('academic_year', {
                  required: 'Academic year is required',
                })}
                type="text"
                id="academic_year"
                className="input-field"
                placeholder="e.g., 2024-2025"
              />
              {errors.academic_year && (
                <p className="mt-1 text-sm text-red-600">{errors.academic_year.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="btn-primary flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Adding...
              </>
            ) : (
              'Add Class'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
