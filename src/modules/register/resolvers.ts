import * as yup from 'yup';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';
import { sendConfirmEmail } from '../../utils/sendEmail';
import { duplicateEmail, emailNotValid } from './errorMessages';
import { passwordSchema } from '../../validations/password';

const schema = yup.object().shape({
    email: yup
        .string()
        .min(3)
        .max(255)
        .email(emailNotValid),
    password: passwordSchema
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
            const user = User.create({
                email: userRequest.email,
                password: userRequest.password
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
