import * as TypeGraphQL from "type-graphql";
import { MenuItem } from "../models/MenuItem";
import { Order } from "../models/Order";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("Restaurant", {})
export class Restaurant {
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
  location!: string;

  menuItems?: MenuItem[];

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  operatingHours!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  owner?: User | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  ownerId?: string | null;

  orders?: Order[];
}
