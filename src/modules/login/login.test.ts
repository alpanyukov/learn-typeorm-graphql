import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import { invalidLoginOrPass, needConfirmEmail } from './errorMessages';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
beforeAll(async () => {
    conn = await createTypeOrmConnection();
});

afterAll(async () => {
    await conn.close();
});

const loginMutation = (email: string, pass: string) => `
mutation {
    login(email: "${email}", password: "${pass}") {
        path,
        message
    }
}
`;

const registerMutation = (email: string, pass: string) => `
mutation {
    register(email: "${email}", password: "${pass}") {
        path,
        message
    }
}
`;

const loginExpectError = async (login: string, pass: string, errorMsg: string) => {
    const response = await request(process.env.TEST_HOST as string, loginMutation(login, pass));

    expect(response).toEqual({
        login: [{ path: 'email', message: errorMsg }]
    });
};

describe('user login', () => {
    const host = process.env.TEST_HOST as string;

    it('login not found', () => loginExpectError('123@123.re', 'lolo', invalidLoginOrPass));

    it('cant login before confirm', async () => {
        const email = 'test@te3.te';
        const pass = '1234';
        await request(host, registerMutation(email, pass));

        await loginExpectError(email, pass, needConfirmEmail);

        await User.update({ email }, { isConfirmed: true });

        await loginExpectError(email, '1', invalidLoginOrPass);

        const response = await request(host, loginMutation(email, pass));
        expect(response).toEqual({ login: null });
    });
});
