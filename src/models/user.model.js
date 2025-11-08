import mongoose, { modelNames } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    hobbies: {
      type: [String],
      required: true,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
        username:String,
      },
    ],
    popularityScore: {
      type: Number,
      default: 0,
    },
    apiKey:{
      type:String,
      unique:true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const User = mongoose.model("Users", userSchema);
