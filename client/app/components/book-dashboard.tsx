'use client';

import React, { useEffect, useState } from 'react';
import {
  Edit2,
  Trash2,
  Tag as TagIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  User as UserIcon,
  BookOpen,
  Star,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getStoredTokens } from '@/lib/api';
import { fetchTags, createTag, deleteTag, Tag } from '@/lib/tags-api';
import {
  fetchBooks,
  fetchBookStats,
  createBook,
  updateBook,
  deleteBook,
  Book,
  BookStats,
  BookStatus,
} from '@/lib/books-api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const statusBorderColors: Record<string, string> = {
  completed: 'border-l-[#4a7c59]',
  reading: 'border-l-[#5b7b97]',
  'want-to-read': 'border-l-[#d4a359]',
  dnf: 'border-l-[#8a8a8a]',
};

export function BookDashboardUI() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  // Server Data States
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<BookStats>({ total: 0, wantToRead: 0, reading: 0, completed: 0, dnf: 0 });
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Pagination States
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  // Filter & Search States (Server-driven)
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog & Modal States
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openTagManager, setOpenTagManager] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form States (Add/Edit Book)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<BookStatus>('want-to-read');
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [pages, setPages] = useState<number | undefined>(undefined);
  const [formError, setFormError] = useState('');

  // Tag Manager Input State
  const [newTagName, setNewTagName] = useState('');
  const [tagError, setTagError] = useState('');

  // Check auth redirect: Require both accessToken and refreshToken stored in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { accessToken, refreshToken } = getStoredTokens();
      if (!accessToken || !refreshToken) {
        router.push('/login');
        return;
      }
    }
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Reset pagination to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedTag, searchQuery]);

  // Load Tags, Stats & Paginated Books directly from server database
  const loadDashboardData = async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      const [tagsData, statsData, booksData] = await Promise.all([
        fetchTags(),
        fetchBookStats(),
        fetchBooks({
          status: selectedStatus,
          tag: selectedTag,
          search: searchQuery,
          page,
          limit,
        }),
      ]);
      setTags(tagsData.results || []);
      setStats(statsData);
      setBooks(booksData.results || []);
      setTotalPages(booksData.totalPages || 1);
      setTotalResults(booksData.totalResults || 0);
    } catch (err) {
      console.error('Error fetching server dashboard data:', err);
    } finally {
      setIsDataLoading(false);
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, [user, selectedStatus, selectedTag, searchQuery, page]);

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus('want-to-read');
    setSelectedTagNames([]);
    setTagInput('');
    setRating(0);
    setPages(undefined);
    setFormError('');
    setSelectedBook(null);
  };

  // Open Edit Form
  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setSelectedTagNames(book.tags ? book.tags.map((t) => t.name) : []);
    setTagInput('');
    setRating(book.rating || 0);
    setPages(book.pages);
    setFormError('');
    setOpenEdit(true);
  };

  // Add tag to selectedTagNames pill list
  const addSelectedTag = (tagName: string) => {
    if (!tagName) return;
    if (!selectedTagNames.includes(tagName)) {
      setSelectedTagNames([...selectedTagNames, tagName]);
    }
  };

  // Remove tag from selectedTagNames pill list
  const removeSelectedTag = (tagName: string) => {
    setSelectedTagNames(selectedTagNames.filter((t) => t !== tagName));
  };

  // Handle Add Book Submit with unique title validation
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title || !author) {
      setFormError('Title and Author are required.');
      return;
    }

    try {
      const customTags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const allTagNames = Array.from(new Set([...selectedTagNames, ...customTags]));

      let tagIds: string[] = [];
      for (const name of allTagNames) {
        const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (existing && existing.id) {
          tagIds.push(existing.id);
        } else {
          const newTag = await createTag({ name });
          if (newTag && newTag.id) {
            tagIds.push(newTag.id);
          }
        }
      }

      await createBook({
        title: title.trim(),
        author: author.trim(),
        status,
        tags: tagIds,
        rating: rating || undefined,
        pages: pages ? Number(pages) : undefined,
      });

      setOpenAdd(false);
      resetForm();
      loadDashboardData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save book to server');
    }
  };

  // Handle Edit Book Submit with unique title validation
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    setFormError('');

    try {
      const customTags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const allTagNames = Array.from(new Set([...selectedTagNames, ...customTags]));

      let tagIds: string[] = [];
      for (const name of allTagNames) {
        const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (existing && existing.id) {
          tagIds.push(existing.id);
        } else {
          const newTag = await createTag({ name });
          if (newTag && newTag.id) {
            tagIds.push(newTag.id);
          }
        }
      }

      await updateBook(selectedBook.id, {
        title: title.trim(),
        author: author.trim(),
        status,
        tags: tagIds,
        rating: rating || undefined,
        pages: pages ? Number(pages) : undefined,
      });

      setOpenEdit(false);
      resetForm();
      loadDashboardData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update book on server');
    }
  };

  // Handle Delete Book
  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;
    try {
      await deleteBook(selectedBook.id);
      setOpenDelete(false);
      setSelectedBook(null);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete book on server:', err);
    }
  };

  // Tag Manager: Add Tag with unique tag validation
  const handleCreateTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError('');
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    if (tags.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
      setTagError('Tag with this name already exists.');
      return;
    }

    try {
      await createTag({ name: trimmedName });
      setNewTagName('');
      loadDashboardData();
    } catch (err: any) {
      setTagError(err.message || 'Failed to create tag');
    }
  };

  // Tag Manager: Delete Tag
  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
      if (selectedTag === tagId) {
        setSelectedTag('');
      }
      loadDashboardData();
    } catch (err: any) {
      setTagError(err.message || 'Failed to delete tag');
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1918] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const startItem = totalResults > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalResults);
  console.log("books" , books)


  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1918] font-sans px-4 py-8 sm:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 1. HEADER ROW */}
        <header className="flex items-start justify-between border-b border-[#e6e0d4] pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#78746d] font-semibold">
              Personal Collection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1918] mt-1">
              {user?.name || 'Reader'}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="font-serif text-4xl leading-none text-[#1a1918]">{stats.total}</div>
              <div className="text-xs uppercase tracking-wider text-[#78746d]">
                Books Cataloged
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none rounded-full cursor-pointer">
                <Avatar className="h-10 w-10 border border-[#e2dccb]">
                  <AvatarFallback className="bg-[#f0ebd9] text-[#1a1918] font-medium">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-[#f5f1e8] border border-[#e2dccb]">
              

                <DropdownMenuItem
                  className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 2. SEARCH & FILTER BAR */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#78746d] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full pl-9 pr-4 py-2 bg-[#f5f1e8] border border-[#e2dccb] rounded text-xs text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:border-[#1a1918] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78746d] hover:text-[#1a1918]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tag Dropdown & Tag Manager trigger */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[160px]">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full appearance-none bg-[#f5f1e8] border border-[#e2dccb] text-[#1a1918] text-xs font-medium rounded px-3 py-2 pr-8 focus:outline-none focus:border-[#1a1918] cursor-pointer"
                >
                  <option value="">All Tags</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78746d] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => setOpenTagManager(true)}
                className="p-2 bg-[#f5f1e8] border border-[#e2dccb] rounded text-[#78746d] hover:text-[#1a1918] transition-colors cursor-pointer"
                title="Manage Tags"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="inline-flex items-center bg-[#f0ebd9]/60 p-1 rounded-md border border-[#e2dccb] flex-wrap gap-1 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'want-to-read', label: `Want to Read (${stats.wantToRead})` },
              { id: 'reading', label: `Reading (${stats.reading})` },
              { id: 'completed', label: `Completed (${stats.completed})` },
              { id: 'dnf', label: `DNF (${stats.dnf})` },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedStatus(item.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedStatus === item.id
                    ? 'bg-[#1a1918] text-[#fcfaf7]'
                    : 'text-[#6e6960] hover:text-[#1a1918]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. BOOK ROWS LIST */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#78746d]">
              Library Catalog {selectedStatus !== 'all' && `• ${selectedStatus.replace('-', ' ')}`}
            </div>
            <button
              onClick={() => {
                resetForm();
                setOpenAdd(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1918] text-white text-xs font-medium rounded hover:bg-[#33312e] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Book
            </button>
          </div>

          {isDataLoading ? (
            /* Skeleton Loading State */
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-[#f5f1e8] border border-[#e2dccb] border-l-4 border-l-[#d8d2c0] rounded-r-md animate-pulse"
                >
                  <div className="space-y-2.5 flex-1 pr-6">
                    <div className="h-4 bg-[#e6e0d4] rounded w-1/3" />
                    <div className="h-3 bg-[#ebe5d9] rounded w-1/4" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-7 h-7 bg-[#e6e0d4] rounded" />
                    <div className="w-7 h-7 bg-[#e6e0d4] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            /* Empty State */
            <div className="bg-[#f5f1e8]/50 border border-dashed border-[#d8d2c0] rounded-md py-16 px-6 text-center space-y-3 my-4">
              <BookOpen className="w-8 h-8 text-[#78746d] mx-auto opacity-70" />
              <h3 className="font-serif text-xl font-normal text-[#1a1918]">
                {selectedStatus === 'all'
                  ? searchQuery
                    ? `No books matching "${searchQuery}"`
                    : 'Your bookshelf is currently empty'
                  : `No books found for status "${selectedStatus}"`}
              </h3>
              <p className="font-sans text-xs text-[#78746d] max-w-sm mx-auto">
                All data is synchronized live with your server database.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    resetForm();
                    setOpenAdd(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1918] text-white rounded text-xs font-medium hover:bg-[#33312e] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add First Book
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Books */
            books.map((book) => {
              const borderClass = statusBorderColors[book.status] || 'border-l-[#1a1918]';
              return (
                <div
                  key={book.id}
                  className={`flex items-center justify-between p-4 bg-[#f5f1e8] border border-[#e2dccb] border-l-4 ${borderClass} rounded-r-md transition-all hover:border-[#c8c0b0]`}
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-lg text-[#1a1918] font-normal leading-snug truncate">
                        {book.title}
                      </h2>
                      {book.rating ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {book.rating}/5
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 font-sans text-xs text-[#78746d] flex-wrap">
                      <span>{book.author}</span>
                      {book.pages ? (
                        <>
                          <span className="text-[#c4beaf]">•</span>
                          <span>{book.pages} pages</span>
                        </>
                      ) : null}
                      {book.tags && book.tags.length > 0 ? (
                        <>
                          <span className="text-[#c4beaf]">•</span>
                          <span className="inline-flex items-center gap-1 text-[#6e6960]">
                            <TagIcon className="w-3 h-3 text-[#78746d]" />{' '}
                            {book.tags.map((t) => t.name).join(', ')}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-[#78746d]">
                    <button
                      onClick={() => handleOpenEdit(book)}
                      className="p-2 hover:text-[#1a1918] transition-colors rounded cursor-pointer"
                      aria-label="Edit Book"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setOpenDelete(true);
                      }}
                      className="p-2 hover:text-red-600 transition-colors rounded cursor-pointer"
                      aria-label="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* 4. PAGINATION CONTROL BAR */}
          {totalResults > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e6e0d4] text-xs text-[#78746d]">
              <div>
                Showing <span className="font-semibold text-[#1a1918]">{startItem}</span> -{' '}
                <span className="font-semibold text-[#1a1918]">{endItem}</span> of{' '}
                <span className="font-semibold text-[#1a1918]">{totalResults}</span> books
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || isDataLoading}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#e2dccb] bg-[#f5f1e8] rounded text-[#1a1918] hover:bg-[#e6e0d4] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="font-medium px-2 text-[#1a1918]">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages || isDataLoading}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#e2dccb] bg-[#f5f1e8] rounded text-[#1a1918] hover:bg-[#e6e0d4] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* --- DIALOGS --- */}

      {/* Add Book Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="bg-[#fcfaf7] border border-[#e2dccb]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#1a1918]">Add New Book</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formError && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">TITLE *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book Title (must be unique)"
                required
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">AUTHOR *</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author Name"
                required
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">READ STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              >
                <option value="want-to-read">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="dnf">Did Not Finish (DNF)</option>
              </select>
            </div>

            {/* Tag Selection Dropdown & Selected Tag Badges */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#78746d]">SELECT TAGS</label>

              <div className="relative">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      addSelectedTag(val);
                      e.target.value = '';
                    }
                  }}
                  className="w-full appearance-none border border-[#e2dccb] bg-[#f5f1e8] p-2 pr-8 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918] cursor-pointer"
                >
                  <option value="">-- Select from existing tags --</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78746d] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedTagNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTagNames.map((tagName) => (
                    <span
                      key={tagName}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0ebd9] border border-[#e2dccb] rounded text-xs text-[#1a1918]"
                    >
                      <TagIcon className="w-3 h-3 text-[#78746d]" />
                      <span>{tagName}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedTag(tagName)}
                        className="hover:text-red-600 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Or type custom tags (comma separated)"
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-xs text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#78746d] mb-1">RATING (0 - 5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={rating || ''}
                  onChange={(e) => setRating(Number(e.target.value))}
                  placeholder="5"
                  className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78746d] mb-1">PAGES</label>
                <input
                  type="number"
                  min="0"
                  value={pages || ''}
                  onChange={(e) => setPages(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="320"
                  className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="submit"
                className="bg-[#1a1918] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#33312e] transition-colors cursor-pointer"
              >
                Save to Server
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#fcfaf7] border border-[#e2dccb]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#1a1918]">Edit Book</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {formError && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">TITLE *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">AUTHOR *</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78746d] mb-1">READ STATUS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              >
                <option value="want-to-read">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="dnf">Did Not Finish (DNF)</option>
              </select>
            </div>

            {/* Tag Selection Dropdown & Selected Tag Badges */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#78746d]">SELECT TAGS</label>

              <div className="relative">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      addSelectedTag(val);
                      e.target.value = '';
                    }
                  }}
                  className="w-full appearance-none border border-[#e2dccb] bg-[#f5f1e8] p-2 pr-8 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918] cursor-pointer"
                >
                  <option value="">-- Select from existing tags --</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78746d] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedTagNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTagNames.map((tagName) => (
                    <span
                      key={tagName}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0ebd9] border border-[#e2dccb] rounded text-xs text-[#1a1918]"
                    >
                      <TagIcon className="w-3 h-3 text-[#78746d]" />
                      <span>{tagName}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedTag(tagName)}
                        className="hover:text-red-600 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Or type custom tags (comma separated)"
                className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-xs text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#78746d] mb-1">RATING (0 - 5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={rating || ''}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78746d] mb-1">PAGES</label>
                <input
                  type="number"
                  min="0"
                  value={pages || ''}
                  onChange={(e) => setPages(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-sm text-[#1a1918] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="submit"
                className="bg-[#1a1918] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#33312e] transition-colors cursor-pointer"
              >
                Update on Server
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="bg-[#fcfaf7] border border-[#e2dccb]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-[#1a1918]">
              Delete "{selectedBook?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#78746d] text-xs">
              This action cannot be undone. The selected volume will be permanently removed from your server database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-[#e2dccb] text-[#1a1918] cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tag Manager Dialog */}
      <Dialog open={openTagManager} onOpenChange={setOpenTagManager}>
        <DialogContent className="bg-[#fcfaf7] border border-[#e2dccb]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#1a1918]">Manage Server Tags</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {tagError && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
                {tagError}
              </div>
            )}

            <form onSubmit={handleCreateTagSubmit} className="flex gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name (e.g. Non-Fiction)"
                className="flex-1 border border-[#e2dccb] bg-[#f5f1e8] p-2 rounded text-xs text-[#1a1918] placeholder:text-[#78746d] focus:outline-none focus:ring-1 focus:ring-[#1a1918]"
              />
              <button
                type="submit"
                className="bg-[#1a1918] text-white px-3 py-2 rounded text-xs font-medium hover:bg-[#33312e] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tag
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78746d]">Existing Tags</span>
              {tags.length === 0 ? (
                <p className="text-xs text-[#78746d]">No tags stored in database yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <div
                      key={t.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f1e8] border border-[#e2dccb] rounded text-xs text-[#1a1918]"
                    >
                      <TagIcon className="w-3 h-3 text-[#78746d]" />
                      <span>{t.name}</span>
                      <button
                        onClick={() => handleDeleteTag(t.id)}
                        className="text-[#78746d] hover:text-red-600 transition-colors ml-1"
                        title="Delete Tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
