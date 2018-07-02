import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
    Query: {
        test4: () => 'test4'
    },
    Mutation: {
        sendForgotPasswordEmail: async (
            _
            // { email }: GQL.ISendForgotPasswordEmailOnMutationArguments
        ) => {
            return true;
        },
        forgotPasswordChange: async (
            _
            // { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments
        ) => {
            return true;
        }
    }
};
