import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";


export const login = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
  where: {
    email,
  },
 });
if (!user) {
  throw new AppError(
    401,
    "INVALID_CREDENTIALS",
    "Invalid email or password"
  );
}
 const matchPassword = await bcrypt.compare(password,user.passwordHash)
 if(!matchPassword){
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password"
    );
 }
 const jwtSecret = process.env.JWT_SECRET;

 if (!jwtSecret) {
   throw new Error("JWT_SECRET is not defined");
 }
 const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: "1d" });

 return { 
    user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
    },
    token
 }
};