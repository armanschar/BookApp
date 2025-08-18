import express from "express";
import {
  GetLogin,
  GetRegister,
  PostRegister,
  PostLogin,
  Logout,
  GetForgot,
  PostForgot,
  GetReset,
  PostReset,
  GetActivate,
} from "../controllers/AuthController.js";
import isAuthForLogin from "../middlewares/isAuthForLogin.js";
import { handleValidationErrors } from "../middlewares/handleValidations.js";
import {
  validatePostLogin,
  validatePostRegister,
  validateActivate,
  validatePostForgot,
  validatePostReset
} from "./validations/auth-validations.js";

const router = express.Router();

// Main entry point - login page
router.get("/", isAuthForLogin, GetLogin);
router.post("/", isAuthForLogin, ...validatePostLogin, handleValidationErrors("/"), PostLogin);
router.get("/register", isAuthForLogin, GetRegister);
router.post("/register", isAuthForLogin, ...validatePostRegister, handleValidationErrors("/register"), PostRegister);

router.get("/forgot", isAuthForLogin, GetForgot);
router.post("/forgot", isAuthForLogin, ...validatePostForgot, handleValidationErrors("/forgot"), PostForgot);

router.get("/reset/:token", isAuthForLogin, GetReset);
router.post("/reset", isAuthForLogin, ...validatePostReset, handleValidationErrors(req => `/reset/${req.body.token}`), PostReset);

router.get("/activate/:token", isAuthForLogin, GetActivate);
router.post("/activate", isAuthForLogin, ...validateActivate, handleValidationErrors("/activate"), GetActivate);

router.get("/logout", Logout);

export default router;
