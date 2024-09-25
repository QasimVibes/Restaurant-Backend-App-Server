import * as TypeGraphQL from "type-graphql";
import { MenuItem } from "../models/MenuItem";
import { Order } from "../models/Order";

@TypeGraphQL.ObjectType("OrderItem", {})
export class OrderItem {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  order?: Order;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  orderId!: string;

  menuItem?: MenuItem;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  menuItemId!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  quantity!: number;
}
