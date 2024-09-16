import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { resolvers as prismaResolvers } from "../prisma/generated/type-graphql";
import { AuthResolver } from "./resolvers/authResolver";
import { CartResolver } from "./resolvers/cartResolver";
import { UserResolver } from "./resolvers/userResolver";
import { RestaurantResolver } from "./resolvers/restaurantResolver";
import prisma from "./libs/prisma";

async function bootstrap() {
  try {
    const schema = await buildSchema({
      resolvers: [
        ...prismaResolvers,
        AuthResolver,
        CartResolver,
        UserResolver,
        RestaurantResolver,
      ],
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
