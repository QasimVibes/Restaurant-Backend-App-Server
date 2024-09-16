import {
  Ctx,
  Query,
  Resolver,
  UseMiddleware,
  Mutation,
  Arg,
} from "type-graphql";
import { GraphQLError } from "graphql";
import { isAuth } from "../middleware/isAuth";
import { GraphQLContext } from "../types/types";
import { Restaurant } from "../../prisma/generated/type-graphql";

@Resolver()
@UseMiddleware(isAuth)
export class RestaurantResolver {
  @Query(() => [Restaurant], { nullable: true })
  async getAllRestaurants(@Ctx() { prisma }: GraphQLContext) {
    try {
      const restaurants = await prisma.restaurant.findMany({});
      return restaurants;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }
  @Mutation(() => Boolean)
  async createRestaurant(
    @Arg("name") name: string,
    @Arg("location") location: string,
    @Arg("operatingHours") operatingHours: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<Boolean> {
    try {
      if (!user || !user.id || user.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const alreadyExists = await prisma.restaurant.findFirst({
        where: {
          name,
          ownerId: user.id,
        },
      });

      if (alreadyExists) {
        throw new GraphQLError("Restaurant already exists", {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      await prisma.restaurant.create({
        data: {
          name,
          location,
          operatingHours,
          ownerId: user.id,
        },
      });

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Arg("id") id: string,
    @Arg("name") name: string,
    @Arg("location") location: string,
    @Arg("operatingHours") operatingHours: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<Boolean> {
    try {
      if (!user || !user.id || user.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id, ownerId: user.id },
      });

      if (!restaurant) {
        throw new GraphQLError("Restaurant not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      }

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name,
          location,
          operatingHours,
        },
      });

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
          originalError: error,
        },
      });
    }
  }
}
