import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import * as path from 'path';

import { resolvers } from './resolvsers';

const server = new GraphQLServer({
    typeDefs: path.resolve(__dirname, 'schema.graphql'),
    resolvers
});
server.start(() => console.log('Server is running on localhost:4000'));
