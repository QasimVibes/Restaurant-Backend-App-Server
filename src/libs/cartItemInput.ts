import { InputType, Field, Int } from "type-graphql";

@InputType()
export class CartItemInput {
  @Field()
  itemId: string = "";

  @Field(() => Int, { nullable: true })
  quantity?: number = 1;
}
