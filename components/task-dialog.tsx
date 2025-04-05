"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createTask, updateTask } from "@/lib/actions"

interface Task {
  _id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string | null
  labels?: string[]
}

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSuccess?: () => void
}

export default function TaskDialog({ open, onOpenChange, task, onSuccess }: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [status, setStatus] = useState<"todo" | "in-progress" | "completed">(task?.status || "todo")
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)
  const [label, setLabel] = useState("")
  const [labels, setLabels] = useState<string[]>(task?.labels || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!task

  const resetForm = () => {
    if (!isEditing) {
      setTitle("")
      setDescription("")
      setStatus("todo")
      setPriority("medium")
      setDueDate(undefined)
      setLabels([])
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleAddLabel = () => {
    if (label.trim() && !labels.includes(label.trim())) {
      setLabels([...labels, label.trim()])
      setLabel("")
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && label.trim()) {
      e.preventDefault()
      handleAddLabel()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("status", status)
      formData.append("priority", priority)

      if (dueDate) {
        formData.append("dueDate", format(dueDate, "yyyy-MM-dd"))
      } else {
        formData.append("dueDate", "")
      }

      formData.append("labels", labels.join(","))

      let result
      if (isEditing) {
        result = await updateTask(task._id, formData)
      } else {
        result = await createTask(formData)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        handleClose()
        if (onSuccess) onSuccess()
        else {
          toast.success(isEditing ? "Task updated successfully" : "Task created successfully")
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your task details below." : "Add a new task to your list. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "todo" | "in-progress" | "completed") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <div className="flex gap-2">
              <Input
                id="labels"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a label"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddLabel} variant="secondary">
                Add
              </Button>
            </div>

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveLabel(label)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {label}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

