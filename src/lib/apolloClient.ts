"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const link = new HttpLink({ uri: "/api/subgraph" });

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

