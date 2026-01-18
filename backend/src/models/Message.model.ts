import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  messageType: 'room' | 'direct';
  room?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient?: mongoose.Types.ObjectId;
  content: string;
  contentType: 'text' | 'file' | 'image' | 'system';
  attachments: Array<{
    filename: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: Array<{
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  threadCount: number;
  reactions: Array<{
    emoji: string;
    users: mongoose.Types.ObjectId[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    messageType: {
      type: String,
      enum: ['room', 'direct'],
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: function (this: IMessage) {
        return this.messageType === 'room';
      }
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: IMessage) {
        return this.messageType === 'direct';
      }
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    contentType: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      default: 'text'
    },
    attachments: [{
      filename: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    threadCount: {
      type: Number,
      default: 0
    },
    reactions: [{
      emoji: String,
      users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  },
  {
    timestamps: true
  }
);

messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ messageType: 1 });

messageSchema.post('save', async function () {
  if (this.messageType === 'room' && this.room) {
    const Room = mongoose.model('Room');
    await Room.findByIdAndUpdate(this.room, {
      lastActivity: new Date(),
      $inc: { messageCount: 1 }
    });
  }
});

export const Message: Model<IMessage> = mongoose.model<IMessage>(
  'Message',
  messageSchema
);