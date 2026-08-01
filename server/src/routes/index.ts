import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import tagRoute from './tag.route';
import bookRoute from './book.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/tags',
    route: tagRoute,
  },
  {
    path: '/books',
    route: bookRoute,
  },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
