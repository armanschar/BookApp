import express from "express";
import {
  GetIndex,
  GetCreate,
  PostCreate,
  GetEdit,
  PostEdit,
  GetDelete,
  PostDelete,
} from "../controllers/PublishersController.js";
import isAuth from "../middlewares/isAuth.js";
import { body } from "express-validator";
import {
  validateCreatePublisher,
  validateEditPublisher,
  validateDeletePublisher
} from "./validations/publishers-validations.js";
import { handleValidationErrors } from "../middlewares/handleValidations.js";
const router = express.Router();

router.get("/", isAuth, GetIndex);
router.get("/create", isAuth, GetCreate);
router.post(
  "/create",
  isAuth,
  validateCreatePublisher,
  handleValidationErrors("/publishers/create"),
  PostCreate
);
router.get("/edit/:publisherId", isAuth, GetEdit);
router.post(
  "/edit",
  isAuth,
  body("publisherId").isMongoId().withMessage("ID de Editorial inválido"),
  ...validateEditPublisher,
  handleValidationErrors(req => `/publishers/edit/${req.body.publisherId}`),
  PostEdit
);
router.get("/delete/:publisherId", isAuth, GetDelete);
router.post(
  "/delete",
  isAuth,
  validateDeletePublisher,
  handleValidationErrors(req => `/publishers/delete/${req.body.publisherId}`),
  PostDelete
);

export default router;
