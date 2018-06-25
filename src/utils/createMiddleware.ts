import { Resolver, GraphQLMiddleware } from '../types/graphql-utils';

export const createMiddleware = (middlewareFunc: GraphQLMiddleware, resolveFunc: Resolver) => (
    parent: any,
    args: any,
    context: any,
    info: any
) => middlewareFunc(resolveFunc, parent, args, context, info);
