import { Post } from '../entities/Post';
import { Field, ObjectType } from 'type-graphql';
import { IMutationResponse } from './MutationResponse';
import { FieldError } from './FieldError';

@ObjectType({ implements: IMutationResponse })
export class PostMutationReposive implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  post?: Post;

  @Field((_type) => [FieldError], { nullable: true })
  error?: FieldError[];
}
