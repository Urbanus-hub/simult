import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvitation extends Document {
  room: mongoose.Types.ObjectId;
  inviter: mongoose.Types.ObjectId;
  inviteeEmail: string;
  inviteeUser?: mongoose.Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  expiresAt: Date;
  acceptedAt?: Date;
  personalMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
}

const invitationSchema = new Schema<IInvitation>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    inviteeUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    acceptedAt: Date,
    personalMessage: {
      type: String,
      maxlength: [200, "Personal message cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

invitationSchema.index({ inviteeEmail: 1, room: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 });
invitationSchema.index({ status: 1 });

invitationSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date() || this.status === "expired";
});

export const Invitation: Model<IInvitation> = mongoose.model<IInvitation>(
  "Invitation",
  invitationSchema,
);
