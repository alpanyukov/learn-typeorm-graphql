import { GraphQLServer } from 'graphql-yoga';
import { createTypeOrmConnection } from './createTypeOrmConnection';
import * as path from 'path';

import { resolvers } from '../resolvsers';

export const startServer = async (port = 4000) => {
    const server = new GraphQLServer({
        typeDefs: path.resolve(__dirname, '../schema.graphql'),
        resolvers
    });

    await createTypeOrmConnection();

    const app = await server.start({ port });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
