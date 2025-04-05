import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Task dashboard",
}

interface PageProps {
  params: { [key: string]: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: PageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }
  
  // Get the status from the URL query parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : "all"
  
  // Fetch tasks based on the status filter
  const { tasks, error } = await getTasks(status !== "all" ? status : undefined)
  
  if (error) {
    console.error("Error fetching tasks:", error)
  }
  
  return <Dashboard initialTasks={tasks || []} initialStatus={status} />
}