import * as TypeGraphQL from "type-graphql";

export enum DeliveryPersonStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
}
TypeGraphQL.registerEnumType(DeliveryPersonStatus, {
  name: "DeliveryPersonStatus",
  description: undefined,
});
