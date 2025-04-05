"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, CheckCircle, Clock, MoreVertical, Pencil, Tag, Trash2, Plus } from 'lucide-react';
import TaskDialog from "@/components/task-dialog";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  labels?: string[];
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: "todo" | "in-progress" | "completed") => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };
  
  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge variant="outline">To Do</Badge>;
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
        <div className="rounded-full bg-muted/20 p-4 mb-4">
          <CheckCircle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          {tasks.length === 0 ? "Create your first task to get started" : "No tasks match the current filter"}
        </p>
        <Button
          variant="outline"
          onClick={() => document.querySelector<HTMLButtonElement>('button:has(.h-4.w-4)')?.click()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add your first task
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card 
          key={task._id} 
          className={`border-l-4 hover:shadow-sm transition-all ${
            task.status === "completed" ? "border-l-green-500" : 
            task.status === "in-progress" ? "border-l-blue-500" : 
            "border-l-gray-300"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h3>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
                {task.description && (
                  <p className={`text-sm text-muted-foreground mb-3 ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-3">
                  {task.dueDate && (
                    <span className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3" />
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    Created: {formatDate(task.createdAt)}
                  </span>
                </div>
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {task.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {task.status !== "completed" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onStatusChange(task._id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Mark Complete</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {task.status !== "todo" && (
                      <DropdownMenuItem onClick={() => onStatusChange(task._id, "todo")}>
                        Mark as To Do
                      </DropdownMenuItem>
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
                    <DropdownMenuItem 
                      className="text-red-500"
                      onClick={() => handleDeleteClick(task._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
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
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {taskToEdit && (
        <TaskDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          task={taskToEdit}
          onSuccess={() => {
            setTaskToEdit(null);
          }}
        />
      )}
    </div>
  );
}
