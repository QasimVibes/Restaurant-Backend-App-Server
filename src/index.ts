import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { resolvers as prismaResolvers } from "../prisma/generated/type-graphql";
import prisma from "./libs/prisma";

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [...prismaResolvers],
    validate: false,
  });

  const yoga = createYoga({
    schema,
    context: (request) => ({
      ...request,
      prisma,
    }),
  });

  const server = createServer(yoga);

  server.listen(4000, () => {
    console.log("Server is running on http://localhost:4000/graphql");
  });
}

bootstrap();
