import tagService from '@/services/tag.service';
import type { AuthedReq } from '@/types';
import { pick } from '@/utils';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

const createTag: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const tag = await tagService.createTag(userId, req.body);
  res.status(httpStatus.CREATED).send(tag);
};

const getTags: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const filter = pick(req.query as Record<string, any>, ['name']);
  const options = pick(req.query as Record<string, any>, ['sortBy', 'limit', 'page']);

  const result = await tagService.queryTags(userId, options, filter);
  res.send(result);
};

const getTag: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const tagId = req.params.tagId as string;
  const tag = await tagService.getTagById(userId, tagId);
  res.send(tag);
};

const updateTag: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const tagId = req.params.tagId as string;
  const tag = await tagService.updateTagById(userId, tagId, req.body);
  res.send(tag);
};

const deleteTag: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const tagId = req.params.tagId as string;
  await tagService.deleteTagById(userId, tagId);
  res.status(httpStatus.NO_CONTENT).send();
};

export default {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
};
