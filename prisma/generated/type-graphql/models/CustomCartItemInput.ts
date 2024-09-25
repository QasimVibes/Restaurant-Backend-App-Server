import { InputType, Field, Int } from "type-graphql";

@InputType()
export class CustomCartItemInput {
  @Field()
  itemId: string = "";

  @Field(() => Int, { nullable: true })
  quantity?: number = 1;
}
