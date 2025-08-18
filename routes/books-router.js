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
import {body} from "express-validator";
import {
  validateCreateBooks,
  validateEditBooks,
  validateDeleteBooks
} from "./validations/books-validations.js";
import { handleValidationErrors } from "../middlewares/handleValidations.js";

const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth,
  validateCreateBooks,
  handleValidationErrors("/books/create"),
  PostCreate);
router.get("/edit/:bookId", isAuth, GetEdit);
router.post("/edit", isAuth,
  body("BookId").isMongoId().withMessage("ID de Libro inválido"),
  ...validateEditBooks,
  handleValidationErrors(req => `/books/edit/${req.body.BookId}`),
  PostEdit);
router.get("/delete/:bookId", isAuth, GetDelete);
router.post("/delete", isAuth,
  validateDeleteBooks,
  handleValidationErrors(req => `/books/delete/${req.body.BookId}`),
  PostDelete);
router.get("/details/:bookId", isAuth, GetDetails);

export default router;
