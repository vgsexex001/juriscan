import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { errorResponse } from "./response";
import { AuthError, ValidationError } from "./errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Context passed to API handlers
 */
export interface ApiContext {
  params: Record<string, string>;
  user?: User;
}

/**
 * API handler function type
 */
type ApiHandler = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse>;

/**
 * Options for apiHandler wrapper
 */
interface ApiHandlerOptions {
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;
}

/**
 * Wraps an API handler with error handling and optional authentication
 *
 * @example
 * export const GET = apiHandler(async (request, { user }) => {
 *   // user is guaranteed to exist when requireAuth is true (default)
 *   return successResponse({ userId: user.id });
 * });
 *
 * @example
 * export const GET = apiHandler(async (request) => {
 *   // Public route, no auth required
 *   return successResponse({ status: 'ok' });
 * }, { requireAuth: false });
 */
export function apiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => Promise<NextResponse> {
  const { requireAuth = true } = options;

  return async (request, context) => {
    try {
      const params = context?.params ? await context.params : {};
      let user: User | undefined;

      if (requireAuth) {
        const supabase = await createServerSupabaseClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          throw new AuthError();
        }

        user = authUser;
      }

      return await handler(request, { params, user });
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(
          new ValidationError("Dados inválidos", error.flatten().fieldErrors)
        );
      }

      return errorResponse(error as Error);
    }
  };
}

/**
 * Parses and validates request JSON body against a Zod schema
 *
 * @example
 * const body = await parseBody(request, createUserSchema);
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const json = await request.json();
    return schema.parse(json);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Dados inválidos", error.flatten().fieldErrors);
    }
    throw new ValidationError("JSON inválido");
  }
}

/**
 * Parses and validates URL search params against a Zod schema
 *
 * @example
 * const params = parseSearchParams(request, paginationSchema);
 */
export function parseSearchParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  return schema.parse(searchParams);
}
