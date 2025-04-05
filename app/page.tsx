import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"

// Use the proper Next.js types for page components
export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }
  
  // Get the status from the URL query parameters
  const status = (searchParams.status as string) || "all"
  
  // Fetch tasks based on the status filter
  const { tasks, error } = await getTasks(status !== "all" ? status : undefined)
  
  if (error) {
    console.error("Error fetching tasks:", error)
  }
  
  return <Dashboard initialTasks={tasks || []} initialStatus={status} />
}