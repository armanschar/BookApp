import express from "express";
import {
  GetIndex,
  GetCreate,
  PostCreate,
  GetEdit,
  PostEdit,
  GetDelete,
  PostDelete
} from "../controllers/PublishersController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get("/edit/:publisherId", isAuth, GetEdit);
router.post("/edit", isAuth, PostEdit);
router.get("/delete/:publisherId", isAuth, GetDelete);
router.post("/delete", isAuth, PostDelete);

export default router;