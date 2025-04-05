import { cookies } from "next/headers"
import { verifyJwtToken } from "./jwt"

export async function getUserFromRequest(request: Request) {
  // For API routes, we need to get the token from the request headers
  const authHeader = request.headers.get("Authorization")
  let token

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Get token from Authorization header
    token = authHeader.substring(7)
  } else {
    // Fallback to cookies
    const cookieStore = cookies()
    token = cookieStore.get("token")?.value
  }

  if (!token) {
    return null
  }

  const payload = await verifyJwtToken(token)
  return payload
}

