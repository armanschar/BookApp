import express from "express";
import {
  GetIndex,
  GetCreate,
  PostCreate,
  GetEdit,
  PostEdit,
  GetDelete,
  PostDelete
} from "../controllers/AuthorsController.js";
import isAuth from "../middlewares/isAuth.js";
import {body} from "express-validator";
import {
  validateCreateAuthors,
  validateEditAuthors,
  validateDeleteAuthors
} from "./validations/authors-validation.js";
import { handleValidationErrors } from "../middlewares/handleValidations.js";

const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth,
  validateCreateAuthors,
  handleValidationErrors("/authors/create"),
  PostCreate);
router.get("/edit/:authorId", isAuth, GetEdit);
router.post("/edit", isAuth,
  body("authorId").isMongoId().withMessage("ID de Autor inválido"),
  ...validateEditAuthors,
  handleValidationErrors(req => `/authors/edit/${req.body.authorId}`),
  PostEdit);
router.get("/delete/:authorId", isAuth, GetDelete);
router.post("/delete", isAuth,
  validateDeleteAuthors,
  handleValidationErrors(req => `/authors/delete/${req.body.authorId}`),
  PostDelete);

export default router;