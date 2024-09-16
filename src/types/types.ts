import { PrismaClient } from "@prisma/client";
import { YogaInitialContext } from "graphql-yoga";

export type JwtPayload = {
  id: string;
  role: string;
};

export type GraphQLContext = {
  prisma: PrismaClient;
  token?: string;
  user?: JwtPayload;
} & YogaInitialContext;
