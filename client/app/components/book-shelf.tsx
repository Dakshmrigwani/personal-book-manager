'use client'

import { useEffect, useState } from 'react'

interface Book {
  id: string
  title: string
  author: string
  status: 'read' | 'reading' | 'want-to-read' | 'dnf'
}

const bookSpineColors: Record<string, { bg: string; text: string; accent: string }> = {
  read: { bg: '#a89080', text: '#faf5f0', accent: '#8b7d77' },
  reading: { bg: '#c8a882', text: '#faf5f0', accent: '#b89570' },
  'want-to-read': { bg: '#7a8696', text: '#faf5f0', accent: '#6b7985' },
  dnf: { bg: '#9d9d9d', text: '#faf5f0', accent: '#8a8a8a' },
}

export function BookShelf() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  const books: Book[] = [
    { id: '1', title: 'The Midnight Library', author: 'Matt Haig', status: 'read' },
    { id: '2', title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', status: 'reading' },
    { id: '3', title: 'Piranesi', author: 'Susanna Clarke', status: 'want-to-read' },
    { id: '4', title: 'The Song of Achilles', author: 'Madeline Miller', status: 'read' },
    { id: '5', title: 'Sea of Tranquility', author: 'Emily St. John Mandel', status: 'want-to-read' },
  ]

  return (
    <div
      className={`transition-all duration-700 ease-out transform ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-end gap-2">
        {books.map((book, index) => {
          const colors = bookSpineColors[book.status]
          const height = [160, 180, 140, 175, 155][index]

          return (
            <div
              key={book.id}
              className="flex flex-col items-center"
              style={{
                animation: isAnimating ? `slideUp 0.6s ease-out ${index * 0.1}s both` : 'none',
              }}
            >
              <div
                className="flex items-center justify-center p-2 rounded-sm shadow-md relative group"
                style={{
                  backgroundColor: colors.bg,
                  height: `${height}px`,
                  width: '60px',
                  minWidth: '60px',
                }}
              >
                <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity" 
                     style={{ backgroundColor: colors.accent }} />
                <div
                  className="text-xs font-serif text-center leading-tight break-words px-1 relative z-10"
                  style={{ color: colors.text, maxWidth: '50px' }}
                >
                  <span className="block text-[10px] font-bold">{book.title.split(' ')[0]}</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-sans text-muted-foreground capitalize">
                  {book.status === 'want-to-read' ? 'Want' : book.status === 'dnf' ? 'DNF' : book.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
