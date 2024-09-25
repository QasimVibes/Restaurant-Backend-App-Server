import * as TypeGraphQL from "type-graphql";
import { Cart } from "../models/Cart";
import { MenuItem } from "../models/MenuItem";

@TypeGraphQL.ObjectType("CartItem", {})
export class CartItem {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  cart?: Cart;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  cartId!: string;

  menuItem?: MenuItem;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  menuItemId!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  quantity!: number;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;
}
