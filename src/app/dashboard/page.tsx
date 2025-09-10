'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { ParentDashboard } from '@/components/dashboard/ParentDashboard'
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'parent':
        return <ParentDashboard />
      case 'teacher':
        return <TeacherDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this dashboard.</p>
            </div>
          </div>
        )
    }
  }

  return renderDashboard()
}