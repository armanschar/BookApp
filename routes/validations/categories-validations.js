import {body} from "express-validator";

export const validateCreateCategory = [
  body("name").trim().notEmpty().withMessage("Nombre requerido").escape(),
  body("description").trim().notEmpty().withMessage("Descripción requerida").escape(),
];

export const validateEditCategory = [
  body("categoryId").isMongoId().withMessage("ID de Categoría inválido"),
  ...validateCreateCategory
];

export const validateDeleteCategory = [
  body("categoryId").isMongoId().withMessage("ID de Categoría inválido")
];
