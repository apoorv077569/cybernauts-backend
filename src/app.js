import express from "express";
import cors from "cors";
import router from "./routes/user.routes.js";
import { userApiKeyValidator } from "./middleware/apiKeyValidiator.middleware.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api",router);

export default app;