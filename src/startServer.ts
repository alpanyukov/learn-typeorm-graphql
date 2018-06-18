import { GraphQLServer } from 'graphql-yoga';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';

export const startServer = async (port = 4000) => {
    await createTypeOrmConnection();

    const server = new GraphQLServer({
        schema: genSchema(),
        context: ({ request }) => ({
            redis,
            url: request.protocol + '://' + request.get('host')
        })
    });

    server.express.get('/confirm/:id', confirmEmail);

    const app = await server.start({ port });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
