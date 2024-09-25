import * as TypeGraphQL from "type-graphql";
import { DeliveryPerson } from "../models/DeliveryPerson";
import { Order } from "../models/Order";
import { DeliveryStatus } from "../enums/DeliveryStatus";

@TypeGraphQL.ObjectType("Delivery", {})
export class Delivery {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  order?: Order;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  orderId!: string;

  deliveryPerson?: DeliveryPerson;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  deliveryPersonId!: string;

  @TypeGraphQL.Field((_type) => DeliveryStatus, {
    nullable: false,
  })
  status!: "ASSIGNED" | "IN_TRANSIT" | "DELIVERED";

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  deliveryTime!: Date;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  deliveryAddress!: string;
}
