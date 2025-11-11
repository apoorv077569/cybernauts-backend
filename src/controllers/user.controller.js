import { User } from "../models/user.model.js";
import calculatePopularityScore from "../utils/popularityCalculator.js";
import crypto from "crypto";

const processHobbyInput = (hobbyString) => {
  if (typeof hobbyString !== "string") return [];
  return hobbyString
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);
};

export const createUser = async (req, res) => {
  try {
    const { username, age, hobbies } = req.body;
    if (!username || !age || !hobbies) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const hobbyArray = processHobbyInput(hobbies);
    const apiKey = crypto.randomBytes(32).toString("hex");
    const newUser = new User({
      username,
      age,
      hobbies: hobbyArray,
      popularityScore: 0,
      apiKey,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      newUser,
      apiKey: newUser.apiKey,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findById(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (deletedUser.friends.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete please unlink with friends",
      });
    }
    await deletedUser.deleteOne();
    res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const createRelationShip = async (req, res) => {
  try {
    const userId = req.params.id;
    const { friendId } = req.body;
    if (!friendId) {
      return res
        .status(400)
        .json({ message: "Missing friendId in request body." });
    }
    if (userId === friendId) {
      return res
        .status(400)
        .json({ message: "Cannot link user to themselves." });
    }

    const userA = await User.findById(userId);
    const userB = await User.findById(friendId);

    if (!userA || !userB) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    // Business Logic: Circular Friendship Prevention (check if friend is already linked)
    if (userA.friends.includes(userB._id)) {
      return res.status(400).json({ message: "Users are already linked." });
    }

    // Link A -> B and B -> A (Mutual Connection)
    userA.friends.push(userB._id);
    userB.friends.push(userA._id);

    // Recalculate and save both scores
    await calculatePopularityScore(userA);
    await calculatePopularityScore(userB);

    await userA.save();
    await userB.save();

    res.status(200).json({
      message: `Successfully linked ${userA.username} and ${userB.username}.`,
      userA: { id: userA.id, score: userA.popularityScore },
      userB: { id: userB.id, score: userB.popularityScore },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const removeRelationShip = async (req, res) => {
  try {
    const userId = req.params.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res
        .status(400)
        .json({ message: "Missing friendId in request body." });
    }

    const userA = await User.findById(userId);
    const userB = await User.findById(friendId);

    if (!userA || !userB) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    // Remove from A's friends list
    userA.friends = userA.friends.filter((id) => id.toString() !== friendId);
    // Remove from B's friends list
    userB.friends = userB.friends.filter((id) => id.toString() !== userId);

    // Recalculate and save both scores
    await calculatePopularityScore(userA);
    await calculatePopularityScore(userB);

    await userA.save();
    await userB.save();

    res.status(200).json({
      message: `Successfully unlinked ${userA.username} and ${userB.username}.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getGraphData = async (req, res) => {
  try {
    const users = await User.find().select(
      "id username popularityScore friends age"
    );

    const nodes = users.map((user) => ({
      id: user.id.toString(),
      data: {
        label: user.username,
        popularityScore: user.popularityScore,
        age: user.age,
      },
      position: {
        x: Math.floor(Math.random() * 800) - 400, 
        y: Math.floor(Math.random() * 800) - 400,
      },
      type: user.popularityScore > 5 ? "highScore" : "lowScore",
    }));

    const edges = [];
    const existingEdges = new Set();

    for (const user of users) {
      for (const friendId of user.friends) {
        const sourceId = user.id.toString();
        const targetId = friendId.toString();

        const edgeKeyA = `${sourceId}-${targetId}`;
        const edgeKeyB = `${targetId}-${sourceId}`;

        if (!existingEdges.has(edgeKeyA) && !existingEdges.has(edgeKeyB)) {
          edges.push({
            id: `e-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            animated: true,
          });
          existingEdges.add(edgeKeyA);
        }
      }
    }

    res.status(200).json({ nodes, edges });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v -friends -hobbies");
    res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, age, hobbies } = req.body;
    const updateData = { username, age };

    if (hobbies) {
      updateData.hobbies = processHobbyInput(hobbies);
    }

    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (hobbies) {
      await calculatePopularityScore(user);
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
