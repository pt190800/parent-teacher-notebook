'use client'

import { DailyNote } from '@/types'
import { format } from 'date-fns'
import { 
  MessageSquare, 
  Download, 
  User, 
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

interface NoteCardProps {
  note: DailyNote
  onComment: () => void
}

export function NoteCard({ note, onComment }: NoteCardProps) {
  const commentCount = note.comments?.length || 0

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {note.student?.first_name} {note.student?.last_name}
            </h3>
            <p className="text-sm text-gray-600">
              {note.teacher?.full_name} • {note.class?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(note.date), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
      </div>

      {/* Attachments */}
      {note.attachments && note.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
          <div className="flex flex-wrap gap-2">
            {note.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg"
              >
                {attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-700">
                  {attachment.split('/').pop()}
                </span>
                <a
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Preview */}
      {commentCount > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Comments ({commentCount})
          </h4>
          <div className="space-y-2">
            {note.comments?.slice(0, 2).map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-medium text-gray-900">
                  {comment.user?.full_name}:
                </span>{' '}
                <span className="text-gray-700">{comment.content}</span>
              </div>
            ))}
            {commentCount > 2 && (
              <p className="text-sm text-gray-500">
                +{commentCount - 2} more comments
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onComment}
          className="btn-secondary flex items-center text-sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {commentCount > 0 ? `Comment (${commentCount})` : 'Add Comment'}
        </button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Posted {format(new Date(note.created_at), 'MMM dd, yyyy \'at\' h:mm a')}</span>
        </div>
      </div>
    </div>
  )
}
