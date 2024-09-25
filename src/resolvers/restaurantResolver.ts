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
import { MenuItem, Restaurant } from "../../prisma/generated/type-graphql";

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
      if (!user || !user?.id || user?.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated or not authorized", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const alreadyExists = await prisma.restaurant.findFirst({
        where: {
          name,
          ownerId: user?.id,
        },
      });

      if (alreadyExists) {
        throw new GraphQLError("Restaurant already exists", {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
            },
          },
        });
      }

      await prisma.restaurant.create({
        data: {
          name,
          location,
          operatingHours,
          ownerId: user?.id,
        },
      });

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: error.extensions?.http || {
            status: 500,
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
      if (!user || !user?.id || user?.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id, ownerId: user?.id },
      });

      if (!restaurant) {
        throw new GraphQLError("Restaurant not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      await prisma.restaurant.update({
        where: { id: restaurant?.id },
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
          },
          originalError: error,
        },
      });
    }
  }

  @Query(() => [MenuItem], { nullable: true })
  async getmenuItems(
    @Arg("restaurantId") restaurantId: string,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<MenuItem[] | null> {
    try {
      const menuItems = await prisma.menuItem.findMany({
        where: { restaurantId },
      });

      return menuItems;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  async createMenuItem(
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("price") price: number,
    @Arg("category") category: string,
    @Arg("imageUrl") imageUrl: string,
    @Arg("restaurantId") restaurantId: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<boolean> {
    try {
      if (!user || !user?.id || user?.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId, ownerId: user?.id },
      });

      if (!restaurant) {
        throw new GraphQLError("Restaurant not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      await prisma.menuItem.create({
        data: {
          name,
          description,
          price,
          category,
          imageUrl,
          restaurantId,
        },
      });
      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  async updateMenuItem(
    @Arg("id") id: string,
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("price") price: number,
    @Arg("category") category: string,
    @Arg("imageUrl") imageUrl: string,
    @Arg("restaurantId") restaurantId: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<boolean> {
    try {
      if (!user || !user?.id || user?.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId,
        },
      });

      if (!menuItem) {
        throw new GraphQLError("MenuItem not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      await prisma.menuItem.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          price,
          category,
          imageUrl,
        },
      });

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
          originalError: error,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  async deleteMenuItem(
    @Arg("id") id: string,
    @Arg("restaurantId") restaurantId: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<boolean> {
    try {
      if (!user || !user?.id || user?.role !== "RESTAURANT_OWNER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: { id, restaurantId },
      });

      if (!menuItem) {
        throw new GraphQLError("MenuItem not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      await prisma.menuItem.delete({ where: { id } });

      return true;
    } catch (error: any) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
          originalError: error,
        },
      });
    }
  }
}
