import { Request, Response } from "express";
import { loginUser } from "../services/auth.service.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "username is required" });
      return;
    }

    const data = await loginUser(username);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Login failed" });
  }
};