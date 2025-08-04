import express from "express";
import {
  GetIndex,
  GetCreate,
  PostCreate,
  GetEdit,
  PostEdit,
  GetDelete,
  PostDelete,
  GetDetails,
} from "../controllers/BooksController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get("/edit/:bookId", isAuth, GetEdit);
router.post("/edit", isAuth, PostEdit);
router.get("/delete/:bookId", isAuth, GetDelete);
router.post("/delete", isAuth, PostDelete);
router.get("/details/:bookId", isAuth, GetDetails);

export default router;
