import jsPDF from 'jspdf'
import { DailyNote, Student, NoteAttachment } from '@/types'
import { format } from 'date-fns'

export interface PDFExportOptions {
  student: Student
  notes: DailyNote[]
  dateFrom?: string
  dateTo?: string
  includeComments?: boolean
  includeAttachments?: boolean
}

export class PDFGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageHeight: number = 280
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
  }

  private addHeader(student: Student, dateFrom?: string, dateTo?: string) {
    // Title
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Parent-Teacher Communication Report', this.margin, this.currentY)
    this.currentY += 10

    // Student info
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Student: ${student.first_name} ${student.last_name}`, this.margin, this.currentY)
    this.currentY += 6

    if (student.student_id) {
      this.doc.text(`Student ID: ${student.student_id}`, this.margin, this.currentY)
      this.currentY += 6
    }

    if (student.class) {
      this.doc.text(`Class: ${student.class.name}`, this.margin, this.currentY)
      this.currentY += 6
    }

    if (student.class?.school) {
      this.doc.text(`School: ${student.class.school.name}`, this.margin, this.currentY)
      this.currentY += 6
    }

    // Date range
    if (dateFrom || dateTo) {
      const dateRange = `Period: ${dateFrom ? format(new Date(dateFrom), 'MMM d, yyyy') : 'Start'} - ${dateTo ? format(new Date(dateTo), 'MMM d, yyyy') : 'Present'}`
      this.doc.text(dateRange, this.margin, this.currentY)
      this.currentY += 6
    }

    // Generated date
    this.doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, this.margin, this.currentY)
    this.currentY += 15

    // Line separator
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, 190, this.currentY)
    this.currentY += 10
  }

  private addNote(note: DailyNote, includeComments: boolean = true, includeAttachments: boolean = true) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight) {
      this.doc.addPage()
      this.currentY = 20
    }

    // Note date and title
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    const noteTitle = note.title || 'Daily Note'
    this.doc.text(`${noteTitle} - ${format(new Date(note.note_date), 'MMM d, yyyy')}`, this.margin, this.currentY)
    this.currentY += 6

    // Teacher info
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`By: ${note.teacher?.first_name} ${note.teacher?.last_name}`, this.margin, this.currentY)
    this.currentY += 6

    // Note content
    this.doc.setFontSize(11)
    const contentLines = this.doc.splitTextToSize(note.content, 170)
    this.doc.text(contentLines, this.margin, this.currentY)
    this.currentY += contentLines.length * 4 + 5

    // Attachments
    if (includeAttachments && note.attachments && note.attachments.length > 0) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Attachments:', this.margin, this.currentY)
      this.currentY += 4

      note.attachments.forEach((attachment) => {
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(`• ${attachment.file_name}`, this.margin + 5, this.currentY)
        this.currentY += 4
      })
      this.currentY += 2
    }

    // Comments
    if (includeComments && note.comments && note.comments.length > 0) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`Comments (${note.comments.length}):`, this.margin, this.currentY)
      this.currentY += 4

      note.comments.forEach((comment) => {
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(`${comment.user?.first_name} ${comment.user?.last_name} - ${format(new Date(comment.created_at), 'MMM d, h:mm a')}`, this.margin + 5, this.currentY)
        this.currentY += 3

        const commentLines = this.doc.splitTextToSize(comment.content, 160)
        this.doc.text(commentLines, this.margin + 5, this.currentY)
        this.currentY += commentLines.length * 3 + 3
      })
      this.currentY += 5
    }

    // Note separator
    this.doc.setLineWidth(0.2)
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, this.currentY, 190, this.currentY)
    this.currentY += 8
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' })
    }
  }

  public generatePDF(options: PDFExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        this.addHeader(options.student, options.dateFrom, options.dateTo)

        if (options.notes.length === 0) {
          this.doc.setFontSize(12)
          this.doc.setFont('helvetica', 'italic')
          this.doc.text('No notes found for the selected period.', this.margin, this.currentY)
        } else {
          options.notes.forEach((note) => {
            this.addNote(note, options.includeComments, options.includeAttachments)
          })
        }

        this.addFooter()

        const pdfBlob = this.doc.output('blob')
        resolve(pdfBlob)
      } catch (error) {
        reject(error)
      }
    })
  }

  public downloadPDF(options: PDFExportOptions, filename?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.generatePDF(options)
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = filename || `parent-teacher-notes-${options.student.first_name}-${options.student.last_name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          resolve()
        })
        .catch(reject)
    })
  }
}

// Utility function for easy PDF generation
export async function generateNotesPDF(options: PDFExportOptions): Promise<Blob> {
  const generator = new PDFGenerator()
  return generator.generatePDF(options)
}

export async function downloadNotesPDF(options: PDFExportOptions, filename?: string): Promise<void> {
  const generator = new PDFGenerator()
  return generator.downloadPDF(options, filename)
}