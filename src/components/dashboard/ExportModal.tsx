'use client'

import { useState } from 'react'
import { DailyNote } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { 
  X, 
  Download, 
  Calendar,
  FileText,
  Loader2
} from 'lucide-react'
import { generatePDF } from '@/lib/pdf-generator'

interface ExportModalProps {
  notes: DailyNote[]
  onClose: () => void
}

export function ExportModal({ notes, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'all' | 'date-range' | 'student'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')

  // Get unique students for filtering
  const students = Array.from(
    new Map(
      notes.map(note => [
        note.student?.id,
        {
          id: note.student?.id,
          name: `${note.student?.first_name} ${note.student?.last_name}`
        }
      ])
    ).values()
  )

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let filteredNotes = notes

      // Apply filters based on export type
      if (exportType === 'date-range') {
        const start = startDate ? new Date(startDate) : startOfMonth(new Date())
        const end = endDate ? new Date(endDate) : endOfMonth(new Date())
        
        filteredNotes = notes.filter(note => {
          const noteDate = new Date(note.date)
          return noteDate >= start && noteDate <= end
        })
      } else if (exportType === 'student' && selectedStudent) {
        filteredNotes = notes.filter(note => note.student?.id === selectedStudent)
      }

      if (filteredNotes.length === 0) {
        alert('No notes found for the selected criteria.')
        return
      }

      // Generate PDF
      await generatePDF(filteredNotes, {
        type: exportType,
        startDate: startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: endDate || format(endOfMonth(new Date()), 'yyyy-MM-dd'),
        studentName: selectedStudent ? students.find(s => s.id === selectedStudent)?.name : undefined
      })

      onClose()
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Notes</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All notes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="date-range"
                  checked={exportType === 'date-range'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Date range</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value="student"
                  checked={exportType === 'student'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Specific student</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          {exportType === 'date-range' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Student Selection */}
          {exportType === 'student' && (
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Export Summary</span>
            </div>
            <p className="text-sm text-gray-600">
              {exportType === 'all' && `Exporting all ${notes.length} notes`}
              {exportType === 'date-range' && 
                `Exporting notes from ${startDate || 'start of month'} to ${endDate || 'end of month'}`
              }
              {exportType === 'student' && selectedStudent && 
                `Exporting notes for ${students.find(s => s.id === selectedStudent)?.name}`
              }
            </p>
          </div>
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
            onClick={handleExport}
            disabled={isExporting || (exportType === 'student' && !selectedStudent)}
            className="btn-primary flex items-center"
          >
            {isExporting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
