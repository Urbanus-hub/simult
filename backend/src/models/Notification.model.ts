import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'room_invitation' | 'message_mention' | 'task_assigned' | 'task_completed' | 
        'task_comment' | 'room_update' | 'member_joined' | 'member_left';
  room?: mongoose.Types.ObjectId;
  message?: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  triggeredBy?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'room_invitation',
        'message_mention',
        'task_assigned',
        'task_completed',
        'task_comment',
        'room_update',
        'member_joined',
        'member_left'
      ],
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room'
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    body: {
      type: String,
      required: true,
      maxlength: 500
    },
    actionUrl: String,
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);