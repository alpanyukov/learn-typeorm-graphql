import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from '../constants';
import { Redis } from 'ioredis';

export const removeUserSession = async (userId: string, redis: Redis) => {
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
};
