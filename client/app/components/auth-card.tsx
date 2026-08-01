'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between px-4 py-8 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 z-10">
        <Link 
          href="/" 
          className="group flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xl shadow-sm">
            B
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            Bookleaf
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto my-auto py-6 z-10">
        <div className="bg-card border border-border/80 shadow-xl rounded-xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-xs text-muted-foreground py-4 z-10">
        <p>© {new Date().getFullYear()} Bookleaf. All rights reserved.</p>
      </footer>
    </div>
  )
}
