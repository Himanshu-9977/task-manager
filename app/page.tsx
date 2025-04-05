import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"

type PageProps = {
  searchParams?: {
    status?: string
  }
}

export default async function Home({ searchParams }: PageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const status = searchParams?.status || "all"

  const { tasks, error } = await getTasks(status !== "all" ? status : undefined)

  if (error) {
    console.error("Error fetching tasks:", error)
  }

  return <Dashboard initialTasks={tasks || []} initialStatus={status} />
}
