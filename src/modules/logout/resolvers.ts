import { ResolverMap } from '../../types/graphql-utils';
import { removeUserSession } from '../../utils/removeUserSession';

export const resolvers: ResolverMap = {
    Mutation: {
        logout: async (_, __, { session, redis }) => {
            const { userId } = session;
            if (userId) {
                await removeUserSession(userId, redis);
                session.destroy(err => {
                    if (err) {
                        console.log(err);
                    }
                });
                return true;
            }
            return false;
        }
    }
};
