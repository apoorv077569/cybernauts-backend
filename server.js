import app from "./src/app.js";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();

connectDB();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));