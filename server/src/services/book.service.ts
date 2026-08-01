import Book from '@/models/book.model';
import Tag from '@/models/tag.model';
import type { BookStats, BookStatus, IBook, PaginationOptions } from '@/types';
import { ApiError } from '@/utils';
import httpStatus from 'http-status';
import type { Types } from 'mongoose';

const verifyTagsBelongToUser = async (userId: string, tagIds: (string | Types.ObjectId)[]) => {
  if (!tagIds || tagIds.length === 0) return;
  const count = await Tag.countDocuments({ _id: { $in: tagIds }, user: userId });
  if (count !== tagIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more tag IDs are invalid or do not belong to user');
  }
};

const createBook = async (userId: string, bookBody: Partial<IBook>): Promise<IBook> => {
  if (bookBody.title) {
    const existingBook = await Book.findOne({
      user: userId,
      title: { $regex: `^${bookBody.title.trim()}$`, $options: 'i' },
    });
    if (existingBook) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A book with this title already exists in your library');
    }
  }

  if (bookBody.tags && bookBody.tags.length > 0) {
    await verifyTagsBelongToUser(userId, bookBody.tags as string[]);
  }

  const book = await Book.create({
    ...bookBody,
    user: userId,
  });

  return book.populate('tags');
};

const queryBooks = async (
  userId: string,
  options: PaginationOptions,
  filter: { search?: string; status?: BookStatus; tag?: string },
) => {
  const queryFilter: Record<string, any> = { user: userId };

  if (filter.status) {
    queryFilter.status = filter.status;
  }

  if (filter.tag) {
    queryFilter.tags = filter.tag;
  }

  if (filter.search) {
    queryFilter.$or = [
      { title: { $regex: filter.search, $options: 'i' } },
      { author: { $regex: filter.search, $options: 'i' } },
    ];
  }

  const populateOptions = options.populate ? `${options.populate},tags` : 'tags';

  return Book.paginate({ ...options, populate: populateOptions }, queryFilter);
};

const getBookById = async (userId: string, bookId: string): Promise<IBook> => {
  const book = await Book.findOne({ _id: bookId, user: userId }).populate('tags');
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  return book;
};

const updateBookById = async (userId: string, bookId: string, updateBody: Partial<IBook>): Promise<IBook> => {
  const book = await Book.findOne({ _id: bookId, user: userId });
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (updateBody.title) {
    const existingBook = await Book.findOne({
      _id: { $ne: bookId },
      user: userId,
      title: { $regex: `^${updateBody.title.trim()}$`, $options: 'i' },
    });
    if (existingBook) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A book with this title already exists in your library');
    }
  }

  if (updateBody.tags && updateBody.tags.length > 0) {
    await verifyTagsBelongToUser(userId, updateBody.tags as string[]);
  }

  Object.assign(book, updateBody);
  await book.save();
  return book.populate('tags');
};

const deleteBookById = async (userId: string, bookId: string): Promise<IBook> => {
  const book = await Book.findOne({ _id: bookId, user: userId });
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  await book.deleteOne();
  return book;
};

const getBookStats = async (userId: string): Promise<BookStats> => {
  const stats = await Book.aggregate([
    { $match: { user: new Book.base.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const counts: Record<string, number> = {
    'want-to-read': 0,
    reading: 0,
    completed: 0,
    dnf: 0,
  };

  let total = 0;
  for (const item of stats) {
    if (counts[item._id] !== undefined) {
      counts[item._id] = item.count;
    }
    total += item.count;
  }

  return {
    total,
    wantToRead: counts['want-to-read'],
    reading: counts.reading,
    completed: counts.completed,
    dnf: counts.dnf,
  };
};

export default {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getBookStats,
};
