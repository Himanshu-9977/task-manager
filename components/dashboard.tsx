"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, ListTodo } from "lucide-react"
import { toast } from "sonner"
import TaskDialog from "@/components/task-dialog"
import TaskList from "@/components/task-list"
import TaskBoard from "@/components/task-board"
import { updateTaskStatus, deleteTask } from "@/lib/actions"
import Link from "next/link"

interface Task {
  _id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string | null
  labels?: string[]
  createdAt: string
}

interface DashboardProps {
  initialTasks: Task[]
  initialStatus: string
}

export default function Dashboard({ initialTasks, initialStatus }: DashboardProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [activeTab, setActiveTab] = useState(initialStatus)

  // Filter tasks based on active tab
  const filteredTasks = activeTab === "all" ? tasks : tasks.filter((task) => task.status === activeTab)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(value === "all" ? "/" : `/?status=${value}`)
  }

  // Update tasks when initialTasks changes (e.g., after server refresh)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleStatusChange = async (id: string, status: "todo" | "in-progress" | "completed") => {
    // Optimistic update
    setTasks(tasks.map((task) => (task._id === id ? { ...task, status } : task)))

    const result = await updateTaskStatus(id, status)

    if (result.error) {
      toast.error(result.error)
      // Revert the optimistic update
      setTasks(initialTasks)
    } else {
      toast.success(`Task moved to ${status.replace("-", " ")}`)
    }
  }

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    const taskToDelete = tasks.find((task) => task._id === id)
    setTasks(tasks.filter((task) => task._id !== id))

    const result = await deleteTask(id)

    if (result.error) {
      toast.error(result.error)
      // Revert the optimistic update
      setTasks(initialTasks)
    } else {
      toast.success("Task deleted successfully")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="flex justify-between items-center mb-8">
        <Link href='/' className="text-xl font-bold cursor-pointer">TaskNest ✏</Link>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {viewMode === "list" && (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div
          className={`flex items-center gap-2 border rounded-md p-1 bg-background shadow-sm ${viewMode === "board" ? "ml-auto" : ""}`}
        >
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("list")}
          >
            <ListTodo className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
          <Button
            variant={viewMode === "board" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("board")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Board View</span>
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <TaskList tasks={filteredTasks} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
      ) : (
        <TaskBoard tasks={filteredTasks} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          toast.success("Task created successfully")
          router.refresh()
        }}
      />
    </div>
  )
}

