import express from "express";
import {
  createUser,
  updateUser,
  getGraphData,
  fetchAllUsers,
  createRelationShip,
  removeRelationShip,
  deleteUser,
} from "../controllers/user.controller.js";
import { userApiKeyValidator } from "../middleware/apiKeyValidiator.middleware.js";

const router = express.Router();

router.get("/users", fetchAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/:id/link", createRelationShip);
router.delete("/users/:id/unlink", removeRelationShip);
router.get("/graph",getGraphData);

export default router;
