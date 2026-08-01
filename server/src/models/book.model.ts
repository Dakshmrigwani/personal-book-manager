import type { IBook, PaginatedModel } from '@/types';
import { Schema, model } from 'mongoose';
import paginate from './plugins/paginate';
import toJSON from './plugins/toJSON';

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['want-to-read', 'reading', 'completed', 'dnf'],
      default: 'want-to-read',
      index: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    pages: {
      type: Number,
      min: 0,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

bookSchema.index({ user: 1, title: 1 }, { unique: true });

bookSchema.plugin(paginate);
bookSchema.plugin(toJSON);

const Book = model<IBook, PaginatedModel<IBook>>('Book', bookSchema);
export default Book;
