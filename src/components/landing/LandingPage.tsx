'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { Phone, Users, BookOpen, Shield, Bell, Download } from 'lucide-react'

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = user.role === 'admin' ? '/dashboard/admin' : 
                         user.role === 'teacher' ? '/dashboard/teacher' : 
                         '/dashboard/parent'
    window.location.href = dashboardPath
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Parent-Teacher Notebook
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('signin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'signin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Digital Communication Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Replace traditional paper notebooks with a secure, modern platform 
                for parent-teacher communication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Easy Access</h3>
                  <p className="text-gray-600">Login with your phone number and password</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Role-Based Access</h3>
                  <p className="text-gray-600">Separate dashboards for parents, teachers, and admins</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Notes</h3>
                  <p className="text-gray-600">Teachers can upload daily notes with attachments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-gray-600">Email alerts when new notes are posted</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Export to PDF</h3>
                  <p className="text-gray-600">Download notes and history as PDF files</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Secure & Private</h3>
                  <p className="text-gray-600">End-to-end encryption and secure data storage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {activeTab === 'signin' ? (
              <SignInForm onSwitchToSignUp={() => setActiveTab('signup')} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setActiveTab('signin')} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Parent-Teacher Notebook. All rights reserved.</p>
            <p className="mt-2">Built with Next.js, Supabase, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}