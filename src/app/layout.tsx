import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parent-Teacher Contact Notebook',
  description: 'Digital platform for parent-teacher communication and daily contact notes',
  keywords: ['parent-teacher', 'education', 'communication', 'notebook', 'school'],
  authors: [{ name: 'Parent-Teacher Notebook Team' }]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
