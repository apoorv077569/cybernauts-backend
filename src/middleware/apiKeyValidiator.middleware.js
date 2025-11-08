// src/middleware/userApiKeyValidator.js
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const userApiKeyValidator = async (req, res, next) => {
  try {
    const providedKey = req.header("x-api-key") || req.query.apiKey || process.env.API_KEY_SECRET;

    if (!providedKey) {
      return res.status(401).json({
        success: false,
        message: "API key is missing",
      });
    }

    // Look up user with this key
    const user = await User.findOne({ apiKey: providedKey });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
    }

    // Attach user data to request
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during API key validation",
    });
  }
};
