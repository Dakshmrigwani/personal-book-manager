import app from '@/app';
import Tag from '@/models/tag.model';
import type { ITag } from '@/types';
import httpStatus from 'http-status';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';
import { insertUsers, userOne, userTwo } from '../fixtures/user.fixture';

describe('Tag routes', () => {
  describe('POST /v1/tags', () => {
    let newTag: { name: string; color?: string };

    beforeEach(async () => {
      newTag = {
        name: 'Fiction',
        color: '#6b8e68',
      };
      await Tag.deleteMany({});
    });

    it('should return 201 and create tag if data is valid', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/tags')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTag)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newTag.name,
        color: newTag.color,
        user: userOne._id.toHexString(),
      });

      const dbTag = await Tag.findById(res.body.id);
      expect(dbTag).toBeDefined();
      expect(dbTag?.name).toBe(newTag.name);
    });

    it('should return 400 if tag with same name already exists for user', async () => {
      await insertUsers([userOne]);
      await Tag.create({ name: 'Fiction', user: userOne._id });

      await request(app)
        .post('/v1/tags')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTag)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 401 if access token is missing', async () => {
      await request(app).post('/v1/tags').send(newTag).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/tags', () => {
    beforeEach(async () => {
      await Tag.deleteMany({});
    });

    it('should return 200 and list only user tags', async () => {
      await insertUsers([userOne, userTwo]);
      await Tag.create([
        { name: 'Sci-Fi', user: userOne._id },
        { name: 'History', user: userTwo._id },
      ]);

      const res = await request(app)
        .get('/v1/tags')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].name).toBe('Sci-Fi');
    });
  });

  describe('PATCH /v1/tags/:tagId', () => {
    beforeEach(async () => {
      await Tag.deleteMany({});
    });

    it('should return 200 and update tag', async () => {
      await insertUsers([userOne]);
      const tag = await Tag.create({ name: 'Philosophy', user: userOne._id });

      const res = await request(app)
        .patch(`/v1/tags/${tag.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ name: 'Ancient Philosophy', color: '#1a1918' })
        .expect(httpStatus.OK);

      expect(res.body.name).toBe('Ancient Philosophy');
      expect(res.body.color).toBe('#1a1918');
    });
  });

  describe('DELETE /v1/tags/:tagId', () => {
    beforeEach(async () => {
      await Tag.deleteMany({});
    });

    it('should return 204 and delete tag', async () => {
      await insertUsers([userOne]);
      const tag = await Tag.create({ name: 'Classics', user: userOne._id });

      await request(app)
        .delete(`/v1/tags/${tag.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      const dbTag = await Tag.findById(tag.id);
      expect(dbTag).toBeNull();
    });
  });
});
