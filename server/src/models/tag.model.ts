import type { ITag, PaginatedModel } from '@/types';
import { Schema, model } from 'mongoose';
import paginate from './plugins/paginate';
import toJSON from './plugins/toJSON';

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: '#6e6960',
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

tagSchema.index({ user: 1, name: 1 }, { unique: true });

tagSchema.plugin(paginate);
tagSchema.plugin(toJSON);

const Tag = model<ITag, PaginatedModel<ITag>>('Tag', tagSchema);
export default Tag;
