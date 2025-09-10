'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: {
    phone_number: string
    email?: string
    password: string
    first_name: string
    last_name: string
    role: UserRole
  }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (phone: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  const signIn = async (phone: string, password: string) => {
    try {
      setLoading(true)
      
      // First, get the user by phone number to get their email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, is_active')
        .eq('phone_number', phone)
        .single()

      if (userError || !userData) {
        return { success: false, error: 'Invalid phone number or password' }
      }

      if (!userData.is_active) {
        return { success: false, error: 'Account is deactivated' }
      }

      if (!userData.email) {
        return { success: false, error: 'Account setup incomplete. Please contact administrator.' }
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await fetchUserProfile(data.user.id)
        
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: {
    phone_number: string
    email?: string
    password: string
    first_name: string
    last_name: string
    role: UserRole
  }) => {
    try {
      setLoading(true)

      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', data.phone_number)
        .single()

      if (existingUser) {
        return { success: false, error: 'Phone number already registered' }
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email || `${data.phone_number}@temp.com`,
        password: data.password,
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          phone_number: data.phone_number,
          email: data.email,
          password_hash: '', // Supabase handles password hashing
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        })

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Failed to create user profile' }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update local user state
      setUser({ ...user, ...data })
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const resetPassword = async (phone: string) => {
    try {
      // Get user email by phone
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('phone_number', phone)
        .single()

      if (userError || !userData?.email) {
        return { success: false, error: 'Phone number not found' }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}