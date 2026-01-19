import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user from the session
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  };
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse(message = "No autenticado") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Higher-order function to protect API routes
 * Extracts user from session and passes to handler
 */
export function withAuth<T>(
  handler: (
    req: Request,
    context: { params: T; user: { id: string; email?: string | null } }
  ) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: T }) => {
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    return handler(req, { ...context, user });
  };
}

/**
 * Validates that the user is authenticated and returns their ID
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  return user.id;
}

/**
 * Get user ID for API routes - returns null during migration period
 * This allows backward compatibility while transitioning to multi-user
 */
export async function getUserIdForApi(): Promise<string | null> {
  const user = await getAuthenticatedUser();
  return user?.id || null;
}

/**
 * Build a where clause that includes userId filter
 * During migration, if userId is null, returns empty object (no filter)
 */
export function buildUserFilter(userId: string | null): { userId?: string } {
  if (!userId) {
    return {};
  }
  return { userId };
}

/**
 * Build a where clause for entities that may or may not have userId
 * This is for the transition period where some data doesn't have userId yet
 */
export function buildUserOrNullFilter(userId: string | null): {
  OR?: Array<{ userId: string | null }>;
} {
  if (!userId) {
    return {};
  }
  // Include both user's data and legacy data (userId = null)
  return {
    OR: [{ userId }, { userId: null }],
  };
}
