import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://banchukchoe.us-east-a.ibm.stepzen.net/api/looming-squirrel/__graphql",
  headers: {
    Authorization: `Apikey ${process.env.NEXT_PUBLIC_STEPZEN_API_KEY}`,
    'Content-Type': 'application/json'
  },
  cache: new InMemoryCache(),
});

export default client;