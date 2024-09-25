import { NonEmptyArray } from "type-graphql";
import { AuthResolver } from "./authResolver";
import { CartResolver } from "./cartResolver";
import { UserResolver } from "./userResolver";
import { RestaurantResolver } from "./restaurantResolver";
import { OrderResolver } from "./orderResolver";
import { DeliveryResolver } from "./deliveryResolver";

export const resolvers: NonEmptyArray<Function> = [
  AuthResolver,
  CartResolver,
  UserResolver,
  RestaurantResolver,
  OrderResolver,
  DeliveryResolver,
];
