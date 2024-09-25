import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import prisma from "./libs/prisma";
import { resolvers } from "./resolvers";

async function bootstrap() {
  try {
    const schema = await buildSchema({
      resolvers,
      validate: false,
    });

    const yoga = createYoga({
      schema,
      context: ({ request }) => {
        return {
          ...request,
          prisma,
        };
      },
    });

    const server = createServer(yoga);

    server.listen(4000, () => {
      console.log("Server is running on http://localhost:4000/graphql");
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

bootstrap();
