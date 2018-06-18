import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import * as path from 'path';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import * as Redis from 'ioredis';
import { User } from './entity/User';

export const startServer = async (port = 4000) => {
    const schemas: GraphQLSchema[] = [];
    const folders = fs.readdirSync(path.resolve(__dirname, 'modules'));
    folders.forEach(folder => {
        const { resolvers } = require(`./modules/${folder}/resolvers`);
        const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
        schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    });

    await createTypeOrmConnection();

    const redis = new Redis(6379, 'localhost');

    const server = new GraphQLServer({
        schema: mergeSchemas({ schemas }),
        context: ({ request }) => ({
            redis,
            url: request.protocol + '://' + request.get('host')
        })
    });

    server.express.get('/confirm/:id', async (req, res) => {
        const { id } = req.params;
        const userId = await redis.get(id);
        if (userId) {
            await User.update({ id: userId }, { isConfirmed: true });
            await redis.del(id);
            res.send('ok');
        } else {
            res.send('invalid');
        }
    });

    const app = await server.start({ port });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
