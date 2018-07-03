import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

export const genSchema = () => {
    const pathToModules = path.resolve(__dirname, '../modules');
    const graphqlTypes = glob
        .sync(`${pathToModules}/**/*.graphql`)
        .map(x => fs.readFileSync(x, { encoding: 'utf-8' }));

    const graphqlResolvers = glob
        .sync(`${pathToModules}/**/resolvers.?s`)
        .map(resolver => require(resolver).resolvers);

    return makeExecutableSchema({
        typeDefs: mergeTypes(graphqlTypes),
        resolvers: mergeResolvers(graphqlResolvers)
    });
};
