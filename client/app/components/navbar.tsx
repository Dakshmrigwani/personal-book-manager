'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-lg">
            B
          </div>
          <span className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            Bookleaf
          </span>
        </Link>

        {/* Right: Navigation links (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 font-sans text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground font-sans text-sm font-medium rounded-md hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 font-sans text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 bg-primary text-primary-foreground font-sans text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-3 font-sans text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-3 font-sans text-sm font-medium text-destructive hover:bg-muted rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-3 font-sans text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-3 bg-primary text-primary-foreground font-sans text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
