import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
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
            url: request.protocol + '://' + request.get('host'),
            session: request.session
        })
    });

    const SessionStore = connectRedis(session);

    server.express.use(
        session({
            store: new SessionStore({
                client: redis as any
            }),
            name: 'sid',
            secret: process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        })
    );

    const cors = {
        credentials: true,
        origin: process.env.NODE_ENV === 'test' ? '*' : `http://localhost:${port}`
    };

    server.express.get('/confirm/:id', confirmEmail);

    const app = await server.start({ port, cors });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
