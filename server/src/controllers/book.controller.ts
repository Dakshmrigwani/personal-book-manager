import bookService from '@/services/book.service';
import type { AuthedReq, BookStatus } from '@/types';
import { pick } from '@/utils';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

const createBook: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const book = await bookService.createBook(userId, req.body);
  res.status(httpStatus.CREATED).send(book);
};

const getBooks: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const filter = pick(req.query as Record<string, any>, ['search', 'status', 'tag']) as {
    search?: string;
    status?: BookStatus;
    tag?: string;
  };
  const options = pick(req.query as Record<string, any>, ['sortBy', 'limit', 'page']);

  const result = await bookService.queryBooks(userId, options, filter);
  res.send(result);
};

const getBook: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const bookId = req.params.bookId as string;
  const book = await bookService.getBookById(userId, bookId);
  res.send(book);
};

const updateBook: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const bookId = req.params.bookId as string;
  const book = await bookService.updateBookById(userId, bookId, req.body);
  res.send(book);
};

const deleteBook: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const bookId = req.params.bookId as string;
  await bookService.deleteBookById(userId, bookId);
  res.status(httpStatus.NO_CONTENT).send();
};

const getBookStats: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const stats = await bookService.getBookStats(userId);
  res.send(stats);
};

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBookStats,
};
