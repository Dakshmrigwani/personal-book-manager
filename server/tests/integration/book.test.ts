import app from '@/app';
import Book from '@/models/book.model';
import Tag from '@/models/tag.model';
import httpStatus from 'http-status';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { userOneAccessToken } from '../fixtures/token.fixture';
import { insertUsers, userOne, userTwo } from '../fixtures/user.fixture';

describe('Book routes', () => {
  beforeEach(async () => {
    await Book.deleteMany({});
    await Tag.deleteMany({});
  });

  describe('POST /v1/books', () => {
    it('should return 201 and create book when data is valid', async () => {
      await insertUsers([userOne]);
      const tag = await Tag.create({ name: 'Horror', user: userOne._id });

      const newBook = {
        title: 'The Haunting of Hill House',
        author: 'Shirley Jackson',
        status: 'completed',
        tags: [tag.id],
        rating: 5,
        pages: 246,
      };

      const res = await request(app)
        .post('/v1/books')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBook)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        title: newBook.title,
        author: newBook.author,
        status: 'completed',
        tags: [
          expect.objectContaining({
            id: tag.id,
            name: 'Horror',
          }),
        ],
        rating: 5,
        pages: 246,
        user: userOne._id.toHexString(),
      });
    });

    it('should default status to want-to-read if not specified', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/books')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          title: 'Piranesi',
          author: 'Susanna Clarke',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.status).toBe('want-to-read');
    });
  });

  describe('GET /v1/books', () => {
    it('should filter books by status', async () => {
      await insertUsers([userOne]);
      await Book.create([
        { title: 'Book 1', author: 'Author 1', status: 'want-to-read', user: userOne._id },
        { title: 'Book 2', author: 'Author 2', status: 'reading', user: userOne._id },
        { title: 'Book 3', author: 'Author 3', status: 'completed', user: userOne._id },
      ]);

      const res = await request(app)
        .get('/v1/books?status=reading')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].title).toBe('Book 2');
    });

    it('should search books by title or author', async () => {
      await insertUsers([userOne]);
      await Book.create([
        { title: 'Stoner', author: 'John Williams', user: userOne._id },
        { title: 'Labyrinths', author: 'Jorge Luis Borges', user: userOne._id },
      ]);

      const res = await request(app)
        .get('/v1/books?search=Borges')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].title).toBe('Labyrinths');
    });
  });

  describe('GET /v1/books/stats', () => {
    it('should return catalog statistics for user', async () => {
      await insertUsers([userOne]);
      await Book.create([
        { title: 'Book 1', author: 'Author 1', status: 'want-to-read', user: userOne._id },
        { title: 'Book 2', author: 'Author 2', status: 'reading', user: userOne._id },
        { title: 'Book 3', author: 'Author 3', status: 'completed', user: userOne._id },
        { title: 'Book 4', author: 'Author 4', status: 'completed', user: userOne._id },
      ]);

      const res = await request(app)
        .get('/v1/books/stats')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        total: 4,
        wantToRead: 1,
        reading: 1,
        completed: 2,
        dnf: 0,
      });
    });
  });

  describe('PATCH /v1/books/:bookId', () => {
    it('should update read status and book attributes', async () => {
      await insertUsers([userOne]);
      const book = await Book.create({
        title: 'Draft Title',
        author: 'Draft Author',
        status: 'reading',
        user: userOne._id,
      });

      const res = await request(app)
        .patch(`/v1/books/${book.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ status: 'completed', rating: 5 })
        .expect(httpStatus.OK);

      expect(res.body.status).toBe('completed');
      expect(res.body.rating).toBe(5);
    });
  });

  describe('DELETE /v1/books/:bookId', () => {
    it('should delete book', async () => {
      await insertUsers([userOne]);
      const book = await Book.create({
        title: 'To Delete',
        author: 'Author',
        user: userOne._id,
      });

      await request(app)
        .delete(`/v1/books/${book.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      const dbBook = await Book.findById(book.id);
      expect(dbBook).toBeNull();
    });
  });
});
