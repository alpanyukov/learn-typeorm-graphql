import { ResolverMap } from '../../types/graphql-utils';
import { removeUserSession } from '../../utils/removeUserSession';

export const resolvers: ResolverMap = {
    Query: {
        test3: () => 'test3'
    },
    Mutation: {
        logout: async (_, __, { session, redis }) => {
            const { userId } = session;
            if (userId) {
                await removeUserSession(userId, redis);
                return true;
            }
            return false;
        }
    }
};
