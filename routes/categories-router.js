import express from "express";
import {
  GetIndex,
  GetCreate,
  PostCreate,
  GetEdit,
  PostEdit,
  GetDelete,
  PostDelete
} from "../controllers/CategoriesController.js";
import isAuth from "../middlewares/isAuth.js";
import {body} from "express-validator";
import{
  validateCreateCategory,
  validateEditCategory,
  validateDeleteCategory
} from "./validations/categories-validations.js";
import { handleValidationErrors } from "../middlewares/handleValidations.js";

const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth,
  validateCreateCategory,
  handleValidationErrors("/categories/create"),
  PostCreate);
router.get("/edit/:categoryId", isAuth, GetEdit);
router.post("/edit", isAuth,
  validateEditCategory,
  handleValidationErrors(req => `/categories/edit/${req.body.categoryId}`),
  PostEdit);
router.get("/delete/:categoryId", isAuth, GetDelete);
router.post("/delete", isAuth,
  validateDeleteCategory,
  handleValidationErrors(req => `/categories/delete/${req.body.categoryId}`),
  PostDelete);

export default router;