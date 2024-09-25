import * as TypeGraphQL from "type-graphql";
import { Delivery } from "../models/Delivery";
import { OrderItem } from "../models/OrderItem";
import { Restaurant } from "../models/Restaurant";
import { User } from "../models/User";
import { OrderStatus } from "../enums/OrderStatus";

@TypeGraphQL.ObjectType("Order", {})
export class Order {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  user?: User;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  restaurant?: Restaurant;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  restaurantId!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Float, {
    nullable: false,
  })
  totalPrice!: number;

  @TypeGraphQL.Field((_type) => OrderStatus, {
    nullable: false,
  })
  status!: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  orderItems?: OrderItem[];

  delivery?: Delivery | null;
}
