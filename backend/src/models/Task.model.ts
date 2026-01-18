import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  room: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'available' | 'claimed' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  assignedTo?: mongoose.Types.ObjectId;
  claimedAt?: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  estimatedHours?: number;
  watchers: mongoose.Types.ObjectId[];
  comments: Array<{
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  checklist: Array<{
    text: string;
    completed: boolean;
    completedBy?: mongoose.Types.ObjectId;
    completedAt?: Date;
  }>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'in-progress', 'review', 'completed', 'cancelled'],
      default: 'available'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: Date,
    completedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dueDate: Date,
    estimatedHours: Number,
    watchers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    checklist: [{
      text: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      completedAt: Date
    }],
    version: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ room: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ room: 1, priority: 1 });

taskSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.version += 1;
  }
  next();
});

taskSchema.post('save', async function () {
  const Room = mongoose.model('Room');
  await Room.findByIdAndUpdate(this.room, {
    $inc: { taskCount: 1 }
  });
});

export const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);