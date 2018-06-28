import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
    Query: {
        test3: () => 'test3'
    },
    Mutation: {
        logout: (_, __, { session }) =>
            new Promise(resolve => {
                session.destroy(err => {
                    if (err) {
                        console.log(err);
                        resolve(false);
                    }

                    resolve(true);
                });
            })
    }
};
