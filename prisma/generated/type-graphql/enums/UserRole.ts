import * as TypeGraphQL from "type-graphql";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  DELIVERY_PERSON = "DELIVERY_PERSON",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
}
TypeGraphQL.registerEnumType(UserRole, {
  name: "UserRole",
  description: undefined,
});
