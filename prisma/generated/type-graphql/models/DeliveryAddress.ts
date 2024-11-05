import * as TypeGraphQL from "type-graphql";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("DeliveryAddress", {})
export class DeliveryAddress {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  user?: User;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  title!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  address!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;
}
