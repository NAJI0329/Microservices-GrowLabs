import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";

const webSocketsLink = new WebSocketLink({
  uri:
    process.env.REACT_APP_ENV === "production"
      ? "wss://glowlabs.herokuapp.com/graphql"
      : "ws://localhost:4000/graphql",
  reconnect: true,
});

const httpLink = new HttpLink({
  uri:
    process.env.REACT_APP_ENV === "production"
      ? "https://glowlabs.herokuapp.com/graphql"
      : "http://localhost:4000/graphql",
  credentials: "include",
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  webSocketsLink,
  httpLink
);

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
  onError: ({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => console.log(message));
    }
  },
});

export default apolloClient;