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
import { User } from "../../prisma/generated/type-graphql";

@Resolver()
@UseMiddleware(isAuth)
export class UserResolver {
  @Query(() => User, { nullable: true })
  async getCurrentUser(
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<User | null> {
    if (!user || !user?.id) {
      throw new GraphQLError("User not authenticated", {
        extensions: {
          code: "UNAUTHORIZED",
          http: {
            status: 401,
          },
        },
      });
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { id: user?.id },
      });
      if (!userData) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      return userData;
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

  @Mutation(() => User)
  async updateUser(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("fullname") fullname: string,
    @Arg("email") email: string,
    @Arg("mobileNumber") mobileNumber: string,
    @Arg("dateOfBirth") dateOfBirth: Date,
    @Arg("imageUrl", { nullable: true }) imageUrl?: string,
    @Arg("address", { nullable: true }) address?: string
  ): Promise<User> {
    try {
      if (!user || !user.id) {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      const existingUserByMobile = await prisma.user.findUnique({
        where: { mobileNumber },
      });

      if (
        (existingUserByEmail && existingUserByEmail?.id !== user?.id) ||
        (existingUserByMobile && existingUserByMobile?.id !== user?.id)
      ) {
        throw new GraphQLError("Mobile number or email already exists", {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
            },
          },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user?.id },
        data: {
          fullname,
          email,
          mobileNumber,
          dateOfBirth,
          address,
          imageUrl,
        },
      });

      if (!updatedUser) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      return updatedUser;
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
}
