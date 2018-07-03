import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';
import { REDIS_SESSION_PREFIX } from './constants';
import * as RateLimit from 'express-rate-limit';
import * as RateLimitRedis from 'rate-limit-redis';
import { createTestConnection } from '../testSetup/createTestConnection';

export const startServer = async (port = 4000) => {
    if (process.env.NODE_ENV === 'test') {
        await redis.flushall();
    }

    const server = new GraphQLServer({
        schema: genSchema(),
        context: ({ request }) => ({
            redis,
            url: request.protocol + '://' + request.get('host'),
            session: request.session,
            req: request
        })
    });

    const SessionStore = connectRedis(session);

    const rateLimit = new RateLimit({
        store: new RateLimitRedis({
            client: redis
        }),
        windowMs: 16 * 60 * 1000,
        max: 100,
        delayMs: 0
    });

    server.express.use(rateLimit);

    server.express.use(
        session({
            store: new SessionStore({
                client: redis as any,
                prefix: REDIS_SESSION_PREFIX
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

    if (process.env.NODE_ENV === 'test') {
        await createTestConnection(true);
    } else {
        await createTypeOrmConnection();
    }

    const app = await server.start({ port, cors });
    console.log(`Server is running on localhost:${port}`);
    return app;
};
