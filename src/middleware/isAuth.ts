import jwt from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { GraphQLContext, JwtPayload } from "../types/types";
import { GraphQLError } from "graphql";

export const isAuth: MiddlewareFn<GraphQLContext> = async (
  { context },
  next
) => {
  const token = context.request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    throw new GraphQLError("Token not found", {
      extensions: {
        code: "UNAUTHORIZED",
        http: {
          status: 401,
        },
      },
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    console.log(payload);

    if (typeof payload === "string" || !payload) {
      throw new GraphQLError("Authorization failed", {
        extensions: {
          code: "UNAUTHORIZED",
          http: {
            status: 401,
          },
        },
      });
    }
    context.user = payload as JwtPayload;
  } catch (error: any) {
    throw new GraphQLError(error.message || "Internal server error", {
      extensions: {
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        http: error.extensions?.http || {
          status: 500,
        },
        originalError: error,
      },
    });
  }

  return next();
};
