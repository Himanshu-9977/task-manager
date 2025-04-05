"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Calendar, MoreVertical, Pencil, Tag, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
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

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (id: string, status: "todo" | "in-progress" | "completed") => void;
  onDelete: (id: string) => void;
}

export default function TaskBoard({ tasks, onStatusChange, onDelete }: TaskBoardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  // Update local tasks when props change
  if (JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
    setLocalTasks(tasks);
  }
  
  // Group tasks by status
  const todoTasks = localTasks.filter(task => task.status === "todo");
  const inProgressTasks = localTasks.filter(task => task.status === "in-progress");
  const completedTasks = localTasks.filter(task => task.status === "completed");
  
  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete);
      setLocalTasks(localTasks.filter(task => task._id !== taskToDelete));
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };
  
  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped back in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Find the task that was dragged
    const task = localTasks.find(t => t._id === draggableId);
    if (!task) return;
    
    // Determine the new status based on the destination droppable
    const newStatus = destination.droppableId as "todo" | "in-progress" | "completed";
    
    // Update the task status locally
    const updatedTasks = localTasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    
    setLocalTasks(updatedTasks);
    
    // Call the parent handler to update the server
    onStatusChange(draggableId, newStatus);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-green-600";
      default:
        return "";
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d");
    } catch (error) {
      return "";
    }
  };
  
  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div>
            <Card className="border-t-2 border-t-gray-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    To Do
                    <Badge variant="outline" className="ml-2">{todoTasks.length}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId="todo">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {todoTasks.length === 0 ? (
                        <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-md m-2">
                          No tasks to do
                        </div>
                      ) : (
                        todoTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card className="p-3 shadow-sm hover:shadow transition-shadow">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{task.title}</h4>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(task.dueDate)}
                                          </span>
                                        )}
                                      </div>
                                      {task.labels && task.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.labels.slice(0, 2).map((label) => (
                                            <Badge key={label} variant="secondary" className="text-xs">
                                              <Tag className="h-3 w-3 mr-1" />
                                              {label}
                                            </Badge>
                                          ))}
                                          {task.labels.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{task.labels.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3 w-3" />
                                          <span className="sr-only">Open menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(task)}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "in-progress")}>
                                          Move to In Progress
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "completed")}>
                                          Move to Completed
                                        </DropdownMenuItem>
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
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
          
          {/* In Progress Column */}
          <div>
            <Card className="border-t-2 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    In Progress
                    <Badge variant="outline" className="ml-2">{inProgressTasks.length}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId="in-progress">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {inProgressTasks.length === 0 ? (
                        <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-md m-2">
                          No tasks in progress
                        </div>
                      ) : (
                        inProgressTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card className="p-3 shadow-sm hover:shadow transition-shadow border-l-4 border-l-blue-500">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{task.title}</h4>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(task.dueDate)}
                                          </span>
                                        )}
                                      </div>
                                      {task.labels && task.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.labels.slice(0, 2).map((label) => (
                                            <Badge key={label} variant="secondary" className="text-xs">
                                              <Tag className="h-3 w-3 mr-1" />
                                              {label}
                                            </Badge>
                                          ))}
                                          {task.labels.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{task.labels.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3 w-3" />
                                          <span className="sr-only">Open menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(task)}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "todo")}>
                                          Move to To Do
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "completed")}>
                                          Move to Completed
                                        </DropdownMenuItem>
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
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
          
          {/* Completed Column */}
          <div>
            <Card className="border-t-2 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    Completed
                    <Badge variant="outline" className="ml-2">{completedTasks.length}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId="completed">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {completedTasks.length === 0 ? (
                        <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-md m-2">
                          No completed tasks
                        </div>
                      ) : (
                        completedTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card className="p-3 shadow-sm hover:shadow transition-shadow border-l-4 border-l-green-500 opacity-80">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm line-through">{task.title}</h4>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 line-through">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(task.dueDate)}
                                          </span>
                                        )}
                                      </div>
                                      {task.labels && task.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.labels.slice(0, 2).map((label) => (
                                            <Badge key={label} variant="secondary" className="text-xs">
                                              <Tag className="h-3 w-3 mr-1" />
                                              {label}
                                            </Badge>
                                          ))}
                                          {task.labels.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{task.labels.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3 w-3" />
                                          <span className="sr-only">Open menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(task)}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "todo")}>
                                          Move to To Do
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(task._id, "in-progress")}>
                                          Move to In Progress
                                        </DropdownMenuItem>
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
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </div>
      </DragDropContext>
      
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
