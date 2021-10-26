import React from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useSubscription,
  split,
  HttpLink
} from "@apollo/client";
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

const NUMBER_INCREMENTED = gql`
  subscription NumberIncrement {
    numberIncremented
  }
`;

const FILE_UPLOADED = gql`
  subscription FileUpload {
    fileUploaded
  }
`;

function LatestNumber() {
  const { data, loading } = useSubscription(
    NUMBER_INCREMENTED
  );

  const { data: fileData } = useSubscription(
    FILE_UPLOADED
  );

  return (
    <div>
      <h4>New number: {!loading && data && data.numberIncremented}</h4>
      <strong>Upload status: {fileData && fileData.fileUploaded ? 'Complete' : 'Pending'}</strong>
    </div>
  );
}

function App() {
  return (
    <div>
      <h2>Apollo app 🚀</h2>
      <LatestNumber/>
    </div>
  );
}

render(
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>,
  document.getElementById("root")
);
