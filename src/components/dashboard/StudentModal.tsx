'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Class, User } from '@/types'
import { X, Loader2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface StudentModalProps {
  classes: Class[]
  parents: User[]
  onClose: () => void
  onStudentAdded: () => void
}

interface StudentFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  class_id: string
  parent_id: string
  student_id: string
}

export function StudentModal({ classes, parents, onClose, onStudentAdded }: StudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>()

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('students')
        .insert(data)

      if (error) throw error

      toast.success('Student added successfully!')
      onStudentAdded()
    } catch (error) {
      console.error('Error adding student:', error)
      toast.error('Failed to add student. Please try again.')
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
            <Users className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add Student</h2>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  id="first_name"
                  className="input-field"
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  id="last_name"
                  className="input-field"
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                {...register('date_of_birth', {
                  required: 'Date of birth is required',
                })}
                type="date"
                id="date_of_birth"
                className="input-field"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                {...register('class_id', {
                  required: 'Please select a class',
                })}
                id="class_id"
                className="input-field"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.school?.name}
                  </option>
                ))}
              </select>
              {errors.class_id && (
                <p className="mt-1 text-sm text-red-600">{errors.class_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                Parent
              </label>
              <select
                {...register('parent_id', {
                  required: 'Please select a parent',
                })}
                id="parent_id"
                className="input-field"
              >
                <option value="">Select a parent</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name}
                  </option>
                ))}
              </select>
              {errors.parent_id && (
                <p className="mt-1 text-sm text-red-600">{errors.parent_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                {...register('student_id', {
                  required: 'Student ID is required',
                  minLength: {
                    value: 3,
                    message: 'Student ID must be at least 3 characters',
                  },
                })}
                type="text"
                id="student_id"
                className="input-field"
                placeholder="e.g., STU001"
              />
              {errors.student_id && (
                <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
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
              'Add Student'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
