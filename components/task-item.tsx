"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, CheckCircle, Clock, MoreVertical } from "lucide-react"

interface Task {
  _id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string | null
  createdAt: string
}

interface TaskItemProps {
  task: Task
  onStatusChange: (id: string, status: "todo" | "in-progress" | "completed") => void
  onDelete: (id: string) => void
  priorityColor: string
}

export default function TaskItem({ task, onStatusChange, onDelete, priorityColor }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getStatusBadge = () => {
    switch (task.status) {
      case "todo":
        return <Badge variant="outline">To Do</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <Card
      className={`border-l-4 ${
        task.status === "completed"
          ? "border-l-green-500"
          : task.status === "in-progress"
            ? "border-l-blue-500"
            : "border-l-gray-300"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              {getStatusBadge()}
            </div>
            {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className={`flex items-center gap-1 ${priorityColor}`}>
                <Clock className="h-3 w-3" />
                Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
              <span className="flex items-center gap-1">Created: {formatDate(task.createdAt)}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "todo" && (
                <DropdownMenuItem onClick={() => onStatusChange(task._id, "todo")}>Mark as To Do</DropdownMenuItem>
              )}
              {task.status !== "in-progress" && (
                <DropdownMenuItem onClick={() => onStatusChange(task._id, "in-progress")}>
                  Mark as In Progress
                </DropdownMenuItem>
              )}
              {task.status !== "completed" && (
                <DropdownMenuItem onClick={() => onStatusChange(task._id, "completed")}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-500" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 flex justify-end">
        {task.status !== "completed" ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-700 hover:bg-green-50"
            onClick={() => onStatusChange(task._id, "completed")}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onStatusChange(task._id, "todo")}
          >
            Reopen
          </Button>
        )}
      </CardFooter>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(task._id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

