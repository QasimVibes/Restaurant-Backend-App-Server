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
  Delivery,
  DeliveryAddress,
  DeliveryPersonStatus,
  DeliveryStatus,
} from "../../prisma/generated/type-graphql";
import { OrderStatus } from "@prisma/client";

@Resolver()
@UseMiddleware(isAuth)
export class DeliveryResolver {
  @Query(() => [Delivery], { nullable: true })
  async getDelivery(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("deliveryStatus", { defaultValue: DeliveryStatus.ASSIGNED })
    deliveryStatus: DeliveryStatus
  ): Promise<Delivery[]> {
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

      const deliveries = await prisma.delivery.findMany({
        where: {
          order: {
            userId: user?.id,
          },
          status: deliveryStatus,
        },
        include: {
          order: true,
        },
      });

      return deliveries;
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
  async updateDeliveryStatus(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("deliveryId") deliveryId: string,
    @Arg("deliveryStatus") deliveryStatus: DeliveryStatus
  ): Promise<boolean> {
    try {
      if (!user || !user?.id || user?.role !== "DELIVERY_PERSON") {
        throw new GraphQLError("User not authenticated or not authorized", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }

      const delivery = await prisma.delivery.findFirst({
        where: {
          id: deliveryId,
          deliveryPerson: {
            userId: user?.id,
          },
        },
      });
      if (!delivery) {
        throw new GraphQLError("Delivery not found or not authorized", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      const deliveryPerson = await prisma.deliveryPerson.findUnique({
        where: {
          userId: user?.id,
        },
      });

      if (!deliveryPerson) {
        throw new GraphQLError("Delivery person not found", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      const updatedDelivery = await prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: deliveryStatus },
      });

      if (updatedDelivery?.status === DeliveryStatus?.DELIVERED) {
        await prisma.order.update({
          where: { id: delivery?.orderId },
          data: { status: OrderStatus?.DELIVERED },
        });

        await prisma.deliveryPerson.update({
          where: { userId: user?.id },
          data: { status: DeliveryPersonStatus?.AVAILABLE },
        });
      }

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

  @Mutation(() => DeliveryAddress)
  async createDeliveryAddress(
    @Ctx() { prisma, user }: GraphQLContext,
    @Arg("address") address: string,
    @Arg("addressTitle") addressTitle: string
  ): Promise<DeliveryAddress> {
    try {
      if (!user || !user?.id || user?.role !== "CUSTOMER") {
        throw new GraphQLError("User not authenticated or not a customer", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }
      const deliveryAddress = await prisma.deliveryAddress.create({
        data: {
          userId: user?.id,
          title: addressTitle,
          address: address,
        },
      });
      return deliveryAddress;
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
  @Query(() => [DeliveryAddress])
  async getDeliveryAddresses(
    @Ctx() { prisma, user }: GraphQLContext
  ): Promise<DeliveryAddress[]> {
    try {
      if (!user || !user?.id || user?.role !== "CUSTOMER") {
        throw new GraphQLError("User not authenticated or not a customer", {
          extensions: {
            code: "UNAUTHORIZED",
            http: {
              status: 401,
            },
          },
        });
      }
      const deliveryAddresses = await prisma.deliveryAddress.findMany({
        where: {
          userId: user?.id,
        },
      });
      return deliveryAddresses;
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
