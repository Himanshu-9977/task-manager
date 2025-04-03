import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTasks } from "@/lib/actions"
import Dashboard from "@/components/dashboard"

export default async function Home({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const status = searchParams.status || "all"
  const { tasks, error } = await getTasks(status)

  return <Dashboard initialTasks={tasks || []} initialStatus={status} />
}

