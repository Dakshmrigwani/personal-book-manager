'use client'

import Link from 'next/link';
import { BookShelf } from './components/book-shelf';
import { Navbar } from './components/navbar';

export default function Home() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 pt-24">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Top: Centered text */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl lg:text-6xl leading-tight text-foreground mb-6">
            Your reading life, visualized
          </h1>
          <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Stop keeping reading stats in your head. Bookleaf turns every page into a data point about what matters to you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-6 py-3 bg-primary text-primary-foreground font-sans font-medium rounded-md hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-transparent border border-primary text-primary font-sans font-medium rounded-md hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Bottom: Book shelf preview */}
        <div className="w-full flex justify-center">
          <BookShelf />
        </div>
      </div>
    </div>
    </>
  )
}

