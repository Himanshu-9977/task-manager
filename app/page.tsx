import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"

export default async function Home() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }
  
  // Fetch tasks based on the status filter
  const { tasks, error } = await getTasks("all")
  
  if (error) {
    console.error("Error fetching tasks:", error)
  }
  
  return <Dashboard initialTasks={tasks || []} initialStatus="all" />
}