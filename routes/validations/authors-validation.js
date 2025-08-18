import {body} from "express-validator";

export const validateCreateAuthors = [
    body("name").trim().notEmpty().withMessage("Nombre requerido").escape(),
    body("email").trim().notEmpty().withMessage("Email requerido").escape(),
];

export const validateEditAuthors = [
    body("authorId").isMongoId().withMessage("ID de Autor inválido"),
    ...validateCreateAuthors
];

export const validateDeleteAuthors = [
    body("authorId").isMongoId().withMessage("ID de Autor inválido")
];
