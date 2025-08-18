import {body} from "express-validator";

export const validatePostLogin = [
    body("Email").trim().notEmpty().withMessage("Email requerido").isEmail().withMessage("Email inválido").escape(),
    body("Password").trim().notEmpty().withMessage("Contraseña requerida").escape(),
];

export const validatePostRegister = [
    body("Name").trim().notEmpty().withMessage("Nombre requerido").escape(),
    body("Email").trim().notEmpty().withMessage("Email requerido").isEmail().withMessage("Email inválido").escape(),
    body("Password").trim().isLength({min: 6}).withMessage("La contraseña debe tener al menos 6 caracteres").escape(),
    body("ConfirmPassword").trim().notEmpty().withMessage("Confirmar contraseña requerida").custom((value, {req}) => {
        if (value !== req.body.Password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }).escape(),
];

export const validateActivate = [
    body("email").trim().notEmpty().withMessage("Email requerido").isEmail().withMessage("Email inválido").escape(),
    body("activationCode").trim().notEmpty().withMessage("Código de activación requerido").escape(),
];

export const validatePostForgot = [
    body("Email").trim().notEmpty().withMessage("Email requerido").isEmail().withMessage("Email inválido").escape(),
];

export const validatePostReset = [
    body("token").trim().notEmpty().withMessage("Token requerido").escape(),
    body("Password").trim().isLength({min: 6}).withMessage("La contraseña debe tener al menos 6 caracteres").escape(),
    body("ConfirmPassword").trim().notEmpty().withMessage("Confirmar contraseña requerida").custom((value, {req}) => {
        if (value !== req.body.Password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }).escape(),
];

