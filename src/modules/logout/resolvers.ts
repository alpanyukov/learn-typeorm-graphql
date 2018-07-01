import { ResolverMap } from '../../types/graphql-utils';
import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from '../../constants';

export const resolvers: ResolverMap = {
    Query: {
        test3: () => 'test3'
    },
    Mutation: {
        logout: async (_, __, { session, redis }) => {
            const { userId } = session;
            if (userId) {
                const rPipeline = redis.multi();

                const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1);
                sessionIds.forEach((key: string) => {
                    // TODO: maybe await
                    rPipeline.del(`${REDIS_SESSION_PREFIX}${key}`);
                });

                await rPipeline.exec(err => {
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
