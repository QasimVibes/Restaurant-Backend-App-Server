import * as TypeGraphQL from "type-graphql";

export enum DeliveryStatus {
  ASSIGNED = "ASSIGNED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED"
}
TypeGraphQL.registerEnumType(DeliveryStatus, {
  name: "DeliveryStatus",
  description: undefined,
});
