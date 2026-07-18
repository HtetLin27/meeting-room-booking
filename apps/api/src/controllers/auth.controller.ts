import type { Request, Response, NextFunction } from "express";
import { login } from "../services/auth.service.js";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. get email and password from req.body
    const { email, password } = req.body
    
    const { user, token } = await login(email, password)

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: 'Login Success', data: { user } })


  } catch (error) {
    next(error);
  }
};