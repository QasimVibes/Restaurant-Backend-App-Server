import { PrismaClient } from "@prisma/client";
import { IncomingMessage } from "http";

export type GraphQLContext = {
  prisma: PrismaClient;
  request: IncomingMessage;
};

export type CustomHeaders = {
  get: (key: string) => string | undefined;
};

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  DELIVERY_PERSON = "DELIVERY_PERSON",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
}
