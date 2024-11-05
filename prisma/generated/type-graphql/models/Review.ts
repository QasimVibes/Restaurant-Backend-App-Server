import * as TypeGraphQL from "type-graphql";
import { MenuItem } from "../models/MenuItem";
import { Restaurant } from "../models/Restaurant";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("Review", {})
export class Review {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  menuItem?: MenuItem;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  menuItemId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  review!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: false,
  })
  rating!: number;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

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
}
