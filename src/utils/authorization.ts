import jwt from "jsonwebtoken";
import { GraphQLContext, CustomHeaders } from "../types/types";

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export const verifyToken = (context: GraphQLContext): string => {
  const headers: CustomHeaders = context.request
    .headers as unknown as CustomHeaders;

  const authorizationHeader = headers.get("authorization");
  if (!authorizationHeader) {
    throw new AuthorizationError("Authorization header is missing.");
  }

  try {
    const token = authorizationHeader.replace("Bearer ", "");
    if (!token) {
      throw new AuthorizationError("Token is missing.");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    if (!decodedToken.userId) {
      throw new AuthorizationError("Invalid token: No user ID found.");
    }
    return decodedToken.userId;
  } catch (err) {
    throw new AuthorizationError("Invalid or expired token.");
  }
};
