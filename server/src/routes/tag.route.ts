import tagController from '@/controllers/tag.controller';
import auth from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import tagValidation from '@/validations/tag.validation';
import express from 'express';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(tagValidation.createTag), tagController.createTag)
  .get(auth(), validate(tagValidation.getTags), tagController.getTags);

router
  .route('/:tagId')
  .get(auth(), validate(tagValidation.getTag), tagController.getTag)
  .patch(auth(), validate(tagValidation.updateTag), tagController.updateTag)
  .delete(auth(), validate(tagValidation.deleteTag), tagController.deleteTag);

export default router;
