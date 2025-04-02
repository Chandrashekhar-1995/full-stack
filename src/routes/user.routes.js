import express from "express";
import { getProfile, login, register, verify } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verify);
router.get("/login", login);
router.get("/get-profile", isLoggedIn, getProfile);

export default router;