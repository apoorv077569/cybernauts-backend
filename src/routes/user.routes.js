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

router.get("/users", userApiKeyValidator,fetchAllUsers);
router.post("/users", createUser);
router.put("/users/:id",userApiKeyValidator, updateUser);
router.delete("/users/:id",userApiKeyValidator, deleteUser);
router.post("/users/:id/link", userApiKeyValidator,createRelationShip);
router.delete("/users/:id/unlink",userApiKeyValidator, removeRelationShip);
router.get("/graph", userApiKeyValidator,getGraphData);

export default router;
