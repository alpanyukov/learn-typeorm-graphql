import { Redis } from 'ioredis';

export type Context = {
    redis: Redis;
    url: string;
    session: Session;
    req: Express.Request;
};

export type Resolver = (parent: any, args: any, context: Context, info: any) => any;

export type GraphQLMiddleware = (
    resolver: Resolver,
    parent: any,
    args: any,
    context: Context,
    info: any
) => any;

export interface ResolverMap {
    [key: string]: {
        [key: string]: Resolver;
    };
}

export interface Session extends Express.Session {
    userId?: string;
}
