import * as TypeGraphQL from "type-graphql";
import { CartItem } from "../models/CartItem";
import { OrderItem } from "../models/OrderItem";
import { Restaurant } from "../models/Restaurant";

@TypeGraphQL.ObjectType("MenuItem", {})
export class MenuItem {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  description!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Float, {
    nullable: false,
  })
  price!: number;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  category!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  imageUrl!: string;

  restaurant?: Restaurant;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  restaurantId!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  orderItems?: OrderItem[];

  cartItems?: CartItem[];
}
