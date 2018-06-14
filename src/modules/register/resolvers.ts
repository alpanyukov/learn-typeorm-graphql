import { hash } from 'bcryptjs';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
    Query: {
        test: () => 'test'
    },
    Mutation: {
        register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
            const hashedPassword = await hash(password, 10);
            const user = User.create({
                email,
                password: hashedPassword
            });

            await user.save();

            return true;
        }
    }
};
