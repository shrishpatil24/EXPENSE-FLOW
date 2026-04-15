import mongoose, { Schema, Document } from "mongoose";
import "./User";

export type GroupRole = "ADMIN" | "MEMBER";

export interface IGroupMemberRole {
  userId: mongoose.Types.ObjectId;
  role: GroupRole;
}

export interface IGroup extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  roles: IGroupMemberRole[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MemberRoleSchema = new Schema<IGroupMemberRole>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    roles: [MemberRoleSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);
