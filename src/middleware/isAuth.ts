import jwt from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { GraphQLContext, JwtPayload } from "../types/types";

export const isAuth: MiddlewareFn<GraphQLContext> = async (
  { context },
  next
) => {
  const token = context.request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    throw new Error("Invalid or missing token");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === "string") {
      throw new Error("Invalid or missing secret");
    }
    context.user = payload as JwtPayload;
  } catch (err) {
    throw new Error("Authorization failed");
  }

  return next();
};
