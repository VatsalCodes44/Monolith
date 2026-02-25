import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../types/type.js";
import jwt from "jsonwebtoken";

export async function jwtVerification(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = verifyJwt.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid request" });
        }
        const { token } = parsed.data;
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }
        console.log("hello")
        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal server error" });
    }
}

