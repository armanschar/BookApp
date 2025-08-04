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

const router = express.Router();

// Main entry point - login page
router.get("/", isAuthForLogin, GetLogin);
router.post("/", isAuthForLogin, PostLogin); // Assuming you have a post handler for login
router.get("/register", isAuthForLogin, GetRegister);
router.post("/register", isAuthForLogin, PostRegister);

router.get("/forgot", isAuthForLogin, GetForgot);
router.post("/forgot", isAuthForLogin, PostForgot);

router.get("/reset/:token", isAuthForLogin, GetReset);
router.post("/reset", isAuthForLogin, PostReset);

router.get("/activate/:token", isAuthForLogin, GetActivate);

router.get("/logout", Logout);

export default router;
