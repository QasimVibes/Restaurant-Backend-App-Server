import * as TypeGraphQL from "type-graphql";
import { CartItem } from "../models/CartItem";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("Cart", {})
export class Cart {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  user?: User;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  cartItems?: CartItem[];

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;
}
