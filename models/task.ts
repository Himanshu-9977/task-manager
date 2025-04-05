import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    userId: {
      type: String,
      required: true,
    },
    labels: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Task || mongoose.model("Task", taskSchema)

