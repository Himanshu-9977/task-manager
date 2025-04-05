import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"

export default async function Home({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get the status from the URL query parameters
  const status = searchParams.status || "all"

  // Fetch tasks based on the status filter
  const { tasks, error } = await getTasks(status !== "all" ? status : undefined)

  if (error) {
    console.error("Error fetching tasks:", error)
  }

  return <Dashboard initialTasks={tasks || []} initialStatus={status} />
}

