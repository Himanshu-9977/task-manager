"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongodb"
import Task from "@/models/task"
import { z } from "zod"

// Schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
})

// Get all tasks for the current user
export async function getTasks(status?: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    // Build query
    const query: any = { userId }

    // Only filter by status if it's a valid status value
    if (status && ["todo", "in-progress", "completed"].includes(status)) {
      query.status = status
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 })

    return { tasks: JSON.parse(JSON.stringify(tasks)) }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { error: "Failed to fetch tasks" }
  }
}

// Get a single task by ID
export async function getTask(id: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    const task = await Task.findOne({ _id: id, userId })

    if (!task) {
      return { error: "Task not found" }
    }

    return { task: JSON.parse(JSON.stringify(task)) }
  } catch (error) {
    console.error("Error fetching task:", error)
    return { error: "Failed to fetch task" }
  }
}

// Create a new task
export async function createTask(formData: FormData) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    // Extract data from form
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as "todo" | "in-progress" | "completed"
    const priority = formData.get("priority") as "low" | "medium" | "high"
    const dueDateStr = formData.get("dueDate") as string
    const labelsStr = formData.get("labels") as string
    const labels = labelsStr ? labelsStr.split(",").map((label) => label.trim()) : []

    // Validate input
    const validation = taskSchema.safeParse({
      title,
      description,
      status,
      priority,
      dueDate: dueDateStr,
      labels,
    })

    if (!validation.success) {
      return { error: validation.error.errors[0].message }
    }

    await connectToDatabase()

    const taskData = validation.data
    const task = new Task({
      ...taskData,
      userId,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    })

    await task.save()

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error creating task:", error)
    return { error: "Failed to create task" }
  }
}

// Update a task
export async function updateTask(id: string, formData: FormData) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    // Extract data from form
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as "todo" | "in-progress" | "completed"
    const priority = formData.get("priority") as "low" | "medium" | "high"
    const dueDateStr = formData.get("dueDate") as string
    const labelsStr = formData.get("labels") as string
    const labels = labelsStr ? labelsStr.split(",").map((label) => label.trim()) : []

    // Validate input
    const validation = taskSchema.safeParse({
      title,
      description,
      status,
      priority,
      dueDate: dueDateStr,
      labels,
    })

    if (!validation.success) {
      return { error: validation.error.errors[0].message }
    }

    await connectToDatabase()

    const taskData = validation.data

    // Process due date if provided
    if (taskData.dueDate) {
      taskData.dueDate = (new Date(taskData.dueDate)).toISOString()
    }

    const task = await Task.findOneAndUpdate({ _id: id, userId }, taskData, { new: true })

    if (!task) {
      return { error: "Task not found" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating task:", error)
    return { error: "Failed to update task" }
  }
}

// Update task status
export async function updateTaskStatus(id: string, status: "todo" | "in-progress" | "completed") {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    const task = await Task.findOneAndUpdate({ _id: id, userId }, { status }, { new: true })

    if (!task) {
      return { error: "Task not found" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating task status:", error)
    return { error: "Failed to update task status" }
  }
}

// Delete a task
export async function deleteTask(id: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    const task = await Task.findOneAndDelete({ _id: id, userId })

    if (!task) {
      return { error: "Task not found" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { error: "Failed to delete task" }
  }
}

