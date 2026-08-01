import Book from '@/models/book.model';
import Tag from '@/models/tag.model';
import type { PaginationOptions } from '@/types';
import { ApiError } from '@/utils';
import httpStatus from 'http-status';

const createTag = async (userId: string, tagBody: { name: string; color?: string }) => {
  const existingTag = await Tag.findOne({
    user: userId,
    name: { $regex: `^${tagBody.name.trim()}$`, $options: 'i' },
  });

  if (existingTag) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tag with this name already exists');
  }

  return Tag.create({
    ...tagBody,
    user: userId,
  });
};

const queryTags = async (userId: string, options: PaginationOptions, filter: { name?: string }) => {
  const queryFilter: Record<string, any> = { user: userId };
  if (filter.name) {
    queryFilter.name = { $regex: filter.name, $options: 'i' };
  }
  return Tag.paginate(options, queryFilter);
};

const getTagById = async (userId: string, tagId: string) => {
  const tag = await Tag.findOne({ _id: tagId, user: userId });
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  return tag;
};

const updateTagById = async (
  userId: string,
  tagId: string,
  updateBody: { name?: string; color?: string },
) => {
  const tag = await getTagById(userId, tagId);

  if (updateBody.name) {
    const existingTag = await Tag.findOne({
      _id: { $ne: tagId },
      user: userId,
      name: { $regex: `^${updateBody.name.trim()}$`, $options: 'i' },
    });
    if (existingTag) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Tag with this name already exists');
    }
  }

  Object.assign(tag, updateBody);
  await tag.save();
  return tag;
};

const deleteTagById = async (userId: string, tagId: string) => {
  const tag = await getTagById(userId, tagId);
  await tag.deleteOne();
  await Book.updateMany({ user: userId, tags: tagId }, { $pull: { tags: tagId } });
  return tag;
};

export default {
  createTag,
  queryTags,
  getTagById,
  updateTagById,
  deleteTagById,
};
