import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { GraphQLError } from "graphql";
import { isAuth } from "../middleware/isAuth";
import { GraphQLContext } from "../types/types";
import {
  CartItem,
  CustomCartItemInput,
} from "../../prisma/generated/type-graphql";

@Resolver()
@UseMiddleware(isAuth)
export class CartResolver {
  @Mutation(() => CartItem)
  async createOrUpdateCart(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("cartItem", () => CustomCartItemInput)
    cartItem: CustomCartItemInput
  ): Promise<CartItem> {
    try {
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
      const existingCart = await prisma.cart.findUnique({
        where: { userId: user?.id },
        include: { cartItems: true },
      });

      if (existingCart) {
        const existingCartItem = existingCart?.cartItems?.find(
          (item) => item?.menuItemId === cartItem?.itemId
        );

        if (existingCartItem) {
          const updatedCartItem = await prisma.cartItem.update({
            where: { id: existingCartItem?.id },
            data: {
              quantity: existingCartItem?.quantity + (cartItem?.quantity || 1),
            },
            include: { menuItem: true },
          });

          return updatedCartItem;
        } else {
          const newCartItem = await prisma.cartItem.create({
            data: {
              menuItem: { connect: { id: cartItem?.itemId } },
              cart: { connect: { id: existingCart?.id } },
              quantity: cartItem?.quantity || 1,
            },
            include: { menuItem: true },
          });

          return newCartItem;
        }
      } else {
        const newCart = await prisma.cart.create({
          data: {
            userId: user?.id,
            cartItems: {
              create: {
                menuItem: { connect: { id: cartItem?.itemId } },
                quantity: cartItem?.quantity || 1,
              },
            },
          },
          include: {
            cartItems: { include: { menuItem: true } },
          },
        });

        return newCart.cartItems[0];
      }
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

  @Query(() => [CartItem], { nullable: true })
  async getCart(
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<CartItem[] | null> {
    try {
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
      const cartItems = await prisma.cartItem.findMany({
        where: {
          cart: {
            userId: user?.id,
          },
        },
        include: {
          menuItem: true,
        },
      });

      if (!cartItems || cartItems.length === 0) {
        throw new GraphQLError("Cart not found for the user", {
          extensions: {
            code: "NOT_FOUND",
            http: { status: 404 },
          },
        });
      }

      return cartItems;
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

  @Mutation(() => [CartItem])
  async deleteCartItem(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("cartItemId") cartItemId: string
  ): Promise<CartItem[]> {
    try {
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

      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        select: { cartId: true },
      });

      if (!cartItem) {
        throw new GraphQLError("Cart item not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      const cart = await prisma.cart.findUnique({
        where: { id: cartItem?.cartId },
        select: { userId: true },
      });

      if (!cart || cart?.userId !== user?.id) {
        throw new GraphQLError("Cart not found or not authorized", {
          extensions: {
            code: "FORBIDDEN",
            http: {
              status: 403,
            },
          },
        });
      }

      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      const remainingCartItems = await prisma.cartItem.findMany({
        where: { cartId: cartItem?.cartId },
      });

      return remainingCartItems;
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
