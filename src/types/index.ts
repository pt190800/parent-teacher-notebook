// User types
export type UserRole = 'parent' | 'teacher' | 'admin'

export interface User {
  id: string
  phone_number: string
  email?: string
  first_name: string
  last_name: string
  role: UserRole
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

// School and Class types
export interface School {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  grade_level?: string
  academic_year: string
  is_active: boolean
  created_at: string
  updated_at: string
  school?: School
}

// Student types
export interface Student {
  id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  student_id?: string
  class_id: string
  parent_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  class?: Class
  parent?: User
}

// Note types
export type NoteStatus = 'draft' | 'published' | 'archived'

export interface DailyNote {
  id: string
  student_id: string
  teacher_id: string
  note_date: string
  title?: string
  content: string
  status: NoteStatus
  created_at: string
  updated_at: string
  student?: Student
  teacher?: User
  attachments?: NoteAttachment[]
  comments?: NoteComment[]
}

export interface NoteAttachment {
  id: string
  note_id: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  uploaded_at: string
}

export interface NoteComment {
  id: string
  note_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

// Teacher-Class assignment
export interface TeacherClass {
  id: string
  teacher_id: string
  class_id: string
  assigned_at: string
  teacher?: User
  class?: Class
}

// Email notification
export interface EmailNotification {
  id: string
  user_id: string
  note_id: string
  email_type: string
  sent_at: string
  status: string
  user?: User
  note?: DailyNote
}

// Activity log
export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  user?: User
}

// Form types
export interface LoginForm {
  phone_number: string
  password: string
}

export interface SignUpForm {
  phone_number: string
  email?: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  role: UserRole
}

export interface NoteForm {
  title?: string
  content: string
  note_date: string
  attachments?: File[]
}

export interface CommentForm {
  content: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter and search types
export interface NoteFilters {
  date_from?: string
  date_to?: string
  keyword?: string
  status?: NoteStatus
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Dashboard data types
export interface ParentDashboardData {
  student: Student
  recent_notes: DailyNote[]
  unread_count: number
  total_notes: number
}

export interface TeacherDashboardData {
  classes: Class[]
  students: Student[]
  recent_notes: DailyNote[]
  pending_notes: DailyNote[]
}

export interface AdminDashboardData {
  total_users: number
  total_students: number
  total_notes: number
  recent_activity: ActivityLog[]
  schools: School[]
}

// Export types
export interface ExportOptions {
  date_from: string
  date_to: string
  format: 'pdf' | 'csv'
  include_comments: boolean
  include_attachments: boolean
}