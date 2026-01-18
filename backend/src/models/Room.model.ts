import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  maxMembers: number;
  settings: {
    allowInvites: boolean;
    allowMemberInvites: boolean;
    muteNonMembers: boolean;
    requireApproval: boolean;
  };
  avatar?: string;
  color?: string;
  lastActivity: Date;
  messageCount: number;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [3, 'Room name must be at least 3 characters'],
      maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPrivate: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 50,
      max: [100, 'Maximum members cannot exceed 100']
    },
    settings: {
      allowInvites: { type: Boolean, default: true },
      allowMemberInvites: { type: Boolean, default: true },
      muteNonMembers: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: false }
    },
    avatar: String,
    color: {
      type: String,
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    messageCount: {
      type: Number,
      default: 0
    },
    taskCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

roomSchema.index({ owner: 1 });
roomSchema.index({ members: 1 });
roomSchema.index({ lastActivity: -1 });
roomSchema.index({ name: 'text' });

roomSchema.pre('save', function (next) {
  if (this.isNew && !this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

export const Room: Model<IRoom> = mongoose.model<IRoom>('Room', roomSchema);