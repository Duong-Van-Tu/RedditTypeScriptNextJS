import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query((_returns) => String) // String is type Graphql
  hello() {
    return 'hello word';
  }
}
