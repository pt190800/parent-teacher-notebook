'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { DailyNote, Comment } from '@/types'
import { format } from 'date-fns'
import { 
  X, 
  Send, 
  User, 
  MessageSquare,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sendCommentNotification } from '@/lib/email-service'

interface CommentModalProps {
  note: DailyNote
  onClose: () => void
  onCommentAdded: () => void
}

interface CommentFormData {
  content: string
}

export function CommentModal({ note, onClose, onCommentAdded }: CommentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>()

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true)
    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          note_id: note.id,
          content: data.content,
        })
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw error

      toast.success('Comment added successfully!')
      reset()
      
      // Send notification for new comment
      if (newComment) {
        await sendCommentNotification(newComment, note)
      }
      
      onCommentAdded()
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Note Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {note.student?.first_name} {note.student?.last_name}
              </h3>
              <p className="text-sm text-gray-600">
                {note.teacher?.full_name} • {format(new Date(note.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">{note.content}</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 max-h-96">
          {note.comments && note.comments.length > 0 ? (
            <div className="space-y-4">
              {note.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.user?.full_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-600">Be the first to comment on this note.</p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment
              </label>
              <textarea
                {...register('content', {
                  required: 'Comment is required',
                  minLength: {
                    value: 1,
                    message: 'Comment cannot be empty',
                  },
                })}
                id="content"
                rows={3}
                className="input-field resize-none"
                placeholder="Write your comment here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
