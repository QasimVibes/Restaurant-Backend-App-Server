import * as TypeGraphQL from "type-graphql";

export enum OrderStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}
TypeGraphQL.registerEnumType(OrderStatus, {
  name: "OrderStatus",
  description: undefined,
});
