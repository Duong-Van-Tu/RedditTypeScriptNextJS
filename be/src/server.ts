require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';

import { COOKIE_NAME, __prod__ } from './constants';
import { Context } from './types/Context';
// db
import { connectDB, connectMongoDB } from './config/db';

// resolvers
import { HelloResolver } from './resolvers/hello';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
// import { HelloResolver } from './resolvers/hello';
const main = async () => {
  const PORT = process.env.PORT || 5000;
  const app = express();
  connectDB();
  connectMongoDB();

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
      cookie: {
        maxAge: 1000 * 60, // one hour
        httpOnly: true, //JS front end cannot access the cookie
        secure: __prod__, // cookie only works in https
        sameSite: 'lax', // protection against CSRF
      },
      secret: process.env.SESSION_SECRET_DEV_PROD as string,
      saveUninitialized: false, // don't save empty sessions, right from the start
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => {
      return { req, res };
    },
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`
    )
  );
};

main().catch((error) => {
  console.log(error);
});

// import { gql } from 'apollo-server-core';
// import { ApolloServer } from 'apollo-server-express';
// import express from 'express';

// const main = async () => {
//   const app = express();
//   const typeDefs = gql`
//     type Book {
//       title: String
//       author: String
//     }
//     type Query {
//       books: [Book]
//     }
//   `;

//   const books = [
//     {
//       title: 'The Awakening',
//       author: 'Kate Chopin',
//     },
//     {
//       title: 'City of Glass',
//       author: 'Paul Auster',
//     },
//   ];

//   const resolvers = {
//     Query: {
//       books: () => books,
//     },
//   };
//   const server = new ApolloServer({ typeDefs, resolvers });
//   await server.start();
//   server.applyMiddleware({ app, cors: true });
//   app.listen(4000, () => {
//     console.log(`🚀  Server on port 4000 localhost:4000${server.graphqlPath}`);
//   });
// };
// main().catch((error) => console.log(error));
