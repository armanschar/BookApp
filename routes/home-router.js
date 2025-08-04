import express from 'express';
import { GetHome } from '../controllers/HomeController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/', isAuth, GetHome);

export default router;