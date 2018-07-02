import { Redis } from 'ioredis';
import { removeUserSession } from './removeUserSession';
import { User } from '../entity/User';

export const forgotPasswordLockAccount = async (userId: string, redis: Redis) => {
    await User.update({ id: userId }, { isForgotPasswordLocked: true });
    await removeUserSession(userId, redis);
};
