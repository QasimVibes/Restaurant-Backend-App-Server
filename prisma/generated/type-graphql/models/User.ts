import * as TypeGraphQL from "type-graphql";
import { Cart } from "../models/Cart";
import { DeliveryPerson } from "../models/DeliveryPerson";
import { Order } from "../models/Order";
import { Restaurant } from "../models/Restaurant";

@TypeGraphQL.ObjectType("User", {})
export class User {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  fullname!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  email!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  mobileNumber!: string;

  password?: string;

  role?: "CUSTOMER" | "DELIVERY_PERSON" | "RESTAURANT_OWNER";

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  dateOfBirth!: Date;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  address?: string | null;

  otp?: string | null;

  otpExpires?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  imageUrl?: string | null;

  orders?: Order[];

  cart?: Cart | null;

  deliveryPerson?: DeliveryPerson | null;

  ownedRestaurants?: Restaurant[];
}
