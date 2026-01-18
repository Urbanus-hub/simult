import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  socketId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  ipAddress: string;
  location?: string;
  isActive: boolean;
  lastPing: Date;
  createdAt: Date;
  disconnectedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: {
      type: String,
      required: true,
      unique: true
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String
    },
    ipAddress: String,
    location: String,
    isActive: {
      type: Boolean,
      default: true
    },
    lastPing: {
      type: Date,
      default: Date.now
    },
    disconnectedAt: Date
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ socketId: 1 }, { unique: true });

export const Session: Model<ISession> = mongoose.model<ISession>(
  'Session',
  sessionSchema
);