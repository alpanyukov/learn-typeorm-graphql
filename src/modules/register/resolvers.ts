import { hash } from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';
import { sendConfirmEmail } from '../../utils/sendEmail';
import { duplicateEmail, passwordMinLength, emailNotValid } from './errorMessages';

const schema = yup.object().shape({
    email: yup
        .string()
        .min(3)
        .max(255)
        .email(emailNotValid),
    password: yup
        .string()
        .min(3, passwordMinLength(3))
        .max(255)
});

export const resolvers: ResolverMap = {
    Query: {
        test: () => 'test'
    },
    Mutation: {
        register: async (_, userRequest: GQL.IRegisterOnMutationArguments, { redis, url }) => {
            try {
                await schema.validate(userRequest, { abortEarly: false });
            } catch (error) {
                return formatYupError(error);
            }

            const userExists = await User.findOne({
                where: { email: userRequest.email },
                select: ['id']
            });

            if (userExists) {
                return [
                    {
                        path: 'email',
                        message: duplicateEmail
                    }
                ];
            }

            const hashedPassword = await hash(userRequest.password, 10);
            const user = User.create({
                email: userRequest.email,
                password: hashedPassword
            });

            await user.save();

            if (process.env.NODE_ENV !== 'test') {
                const link = await createConfirmEmailLink(url, user.id, redis);
                await sendConfirmEmail(user.email, link);
            }

            return null;
        }
    }
};
