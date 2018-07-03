import { ResolverMap } from '../../types/graphql-utils';
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount';
import { User } from '../../entity/User';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { userNotFound, expiredKey } from './errorMessages';
import { sendForgotEmail } from '../../utils/sendEmail';
import { FORGOT_PASSWORD_PREFIX } from '../../constants';
import { passwordSchema } from '../../validations/password';
import { formatYupError } from '../../utils/formatYupError';
import { hash } from 'bcryptjs';
import * as yup from 'yup';
// import { passwordMinLength } from '../register/errorMessages';

const schema = yup.object().shape({
    newPassword: passwordSchema
});

export const resolvers: ResolverMap = {
    Mutation: {
        sendForgotPasswordEmail: async (
            _,
            { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
            { redis, url }
        ) => {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return [{ path: 'email', message: userNotFound }];
            }

            await forgotPasswordLockAccount(user.id, redis);
            const forgotLink = await createForgotPasswordLink(url, user.id, redis);
            await sendForgotEmail(user.email, forgotLink);
            return null;
        },
        forgotPasswordChange: async (
            _,
            { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
            { redis }
        ) => {
            const redisKey = `${FORGOT_PASSWORD_PREFIX}${key}`;

            try {
                await schema.validate({ newPassword }, { abortEarly: false });
            } catch (error) {
                return formatYupError(error);
            }

            const userId = await redis.get(redisKey);
            if (!userId) {
                return [{ path: 'newPassword', message: expiredKey }];
            }

            const hashPassword = await hash(newPassword, 10);

            await Promise.all([
                User.update(
                    { id: userId },
                    { isForgotPasswordLocked: false, password: hashPassword }
                ),
                redis.del(redisKey)
            ]);

            return null;
        }
    }
};
