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
import {
  CartItem,
  DeliveryPersonStatus,
  Order,
  OrderStatus,
} from "../../prisma/generated/type-graphql";
import { DeliveryStatus } from "@prisma/client";

@Resolver()
@UseMiddleware(isAuth)
export class OrderResolver {
  @Query(() => [Order], { nullable: true })
  async getAllOrders(
    @Arg("restaurantId") restaurantId: string,
    @Arg("status", { defaultValue: OrderStatus.PENDING }) status: OrderStatus,
    @Ctx() { prisma }: GraphQLContext
  ): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          restaurantId,
          status,
        },
      });
      return orders;
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
  async createOrder(
    @Arg("cartId") cartId: string,
    @Arg("deliveryAddress") deliveryAddress: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<boolean> {
    try {
      if (!user || !user.id || user.role !== "CUSTOMER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const availableDeliveryPerson = await prisma.deliveryPerson.findFirst({
        where: {
          status: DeliveryPersonStatus.AVAILABLE,
        },
      });

      if (!availableDeliveryPerson) {
        throw new GraphQLError("No delivery person available", {
          extensions: {
            code: "NO_DELIVERY_PERSON_AVAILABLE",
            http: {
              status: 400,
            },
          },
        });
      }

      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          cartItems: {
            include: { menuItem: true },
          },
        },
      });

      if (!cart || cart.userId !== user.id) {
        throw new GraphQLError("Cart not found or belongs to another user", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      if (cart.cartItems.length === 0) {
        throw new GraphQLError("Cart is empty", {
          extensions: {
            code: "EMPTY_CART",
            http: {
              status: 400,
            },
          },
        });
      }

      let totalPrice = 0;
      cart.cartItems.forEach((cartItem) => {
        totalPrice += cartItem.menuItem.price * cartItem.quantity;
      });

      const createdOrder = await prisma.order.create({
        data: {
          userId: user.id,
          restaurantId: cart.cartItems[0]?.menuItem.restaurantId,
          totalPrice,
          status: OrderStatus.PENDING,
          orderItems: {
            create: cart.cartItems.map((cartItem: CartItem) => ({
              menuItemId: cartItem.menuItemId,
              quantity: cartItem.quantity,
            })),
          },
        },
      });

      await prisma.delivery.create({
        data: {
          orderId: createdOrder.id,
          deliveryPersonId: availableDeliveryPerson.id,
          status: DeliveryStatus.ASSIGNED,
          deliveryTime: new Date(Date.now() + 30 * 60 * 1000),
          deliveryAddress,
        },
      });

      await prisma.deliveryPerson.update({
        where: { id: availableDeliveryPerson.id },
        data: {
          status: DeliveryPersonStatus.UNAVAILABLE,
        },
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.delete({ where: { id: cart.id } });

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
  async deleteOrder(
    @Arg("orderId") orderId: string,
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<boolean> {
    try {
      if (!user || !user.id || user.role !== "CUSTOMER") {
        throw new GraphQLError("User not authenticated", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId, status: OrderStatus.PENDING },
      });
      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      const deliveryPersonId = await prisma.delivery.findUnique({
        where: { orderId: orderId },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      await prisma.deliveryPerson.update({
        where: { id: deliveryPersonId?.deliveryPersonId },
        data: {
          status: DeliveryPersonStatus.AVAILABLE,
        },
      });

      await prisma.delivery.deleteMany({ where: { orderId } });
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
}
