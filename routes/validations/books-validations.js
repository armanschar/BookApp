import {body} from "express-validator";

export const validateCreateBooks = [
    body("Title").trim().notEmpty().withMessage("Título requerido").escape(),
    body("PublicationYear").isInt({min: 1450, max: 2035}).withMessage("Año de publicación debe estar entre 1450 y 2035"),
    body("CategoryId").notEmpty().withMessage("Categoría requerida").escape(),
    body("AuthorId").notEmpty().withMessage("Autor requerido").escape(),
    body("PublisherId").notEmpty().withMessage("Editorial requerida").escape(),
];

export const validateEditBooks = [
    body("BookId").isMongoId().withMessage("ID de Libro inválido"),
    ...validateCreateBooks
];

export const validateDeleteBooks = [
    body("BookId").isMongoId().withMessage("ID de Libro inválido")
];
