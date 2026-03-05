import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function jwtVerification(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}