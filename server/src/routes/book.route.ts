import bookController from '@/controllers/book.controller';
import auth from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import bookValidation from '@/validations/book.validation';
import express from 'express';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(bookValidation.createBook), bookController.createBook)
  .get(auth(), validate(bookValidation.getBooks), bookController.getBooks);

router.route('/stats').get(auth(), bookController.getBookStats);

router
  .route('/:bookId')
  .get(auth(), validate(bookValidation.getBook), bookController.getBook)
  .patch(auth(), validate(bookValidation.updateBook), bookController.updateBook)
  .delete(auth(), validate(bookValidation.deleteBook), bookController.deleteBook);

export default router;
