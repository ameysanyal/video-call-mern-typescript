import mongoose, { Document, Types } from "mongoose";
import { UserDocument } from "@/models/user.model.js";

export interface FriendRequestDocument extends Document {
  sender: UserDocument | Types.ObjectId;
  recipient: UserDocument | Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

const friendRequestSchema = new mongoose.Schema<FriendRequestDocument>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const FriendRequest = mongoose.model<FriendRequestDocument>(
  "FriendRequest",
  friendRequestSchema
);

export default FriendRequest;
