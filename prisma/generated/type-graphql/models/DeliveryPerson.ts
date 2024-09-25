import * as TypeGraphQL from "type-graphql";
import { Delivery } from "../models/Delivery";
import { User } from "../models/User";
import { DeliveryPersonStatus } from "../enums/DeliveryPersonStatus";

@TypeGraphQL.ObjectType("DeliveryPerson", {})
export class DeliveryPerson {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  user?: User;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  userId!: string;

  @TypeGraphQL.Field((_type) => DeliveryPersonStatus, {
    nullable: false,
  })
  status!: "AVAILABLE" | "UNAVAILABLE";

  deliveries?: Delivery[];
}
