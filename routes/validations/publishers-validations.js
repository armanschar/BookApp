import {body} from "express-validator";

export const validateCreatePublisher = [
  body("name").trim().notEmpty().withMessage("Nombre requerido").escape(),
  body("phone").trim().notEmpty().withMessage("Teléfono requerido").escape(),
  body("country").trim().notEmpty().withMessage("País requerido").escape(),
];

export const validateEditPublisher = [
  body("publisherId").isMongoId().withMessage("ID de Editorial inválido"),
  ...validateCreatePublisher
];

export const validateDeletePublisher = [
  body("publisherId").isMongoId().withMessage("ID de Editorial inválido")
];
