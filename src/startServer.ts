import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import * as path from 'path';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';

export const startServer = async (port = 4000) => {
    const schemas: GraphQLSchema[] = [];
    const folders = fs.readdirSync(path.resolve(__dirname, 'modules'));
    folders.forEach(folder => {
        const { resolvers } = require(`./modules/${folder}/resolvers`);
        const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
        schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    });

    const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });

    await createTypeOrmConnection();

    const app = await server.start({ port });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
