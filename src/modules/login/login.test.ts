import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { invalidLoginOrPass, needConfirmEmail } from './errorMessages';
import { TestClient } from '../../utils/TestClient';
import { createTestConnection } from '../../../testSetup/createTestConnection';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
beforeAll(async () => {
    conn = await createTestConnection();
});

afterAll(async () => {
    await conn.close();
});

const loginExpectError = async (login: string, pass: string, errorMsg: string) => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const { data } = await client.login(login, pass);

    expect(data).toEqual({
        login: [{ path: 'email', message: errorMsg }]
    });
};

describe('user login', () => {
    const host = process.env.TEST_HOST as string;

    it('login not found', () => loginExpectError('123@123.re', 'lolo', invalidLoginOrPass));

    it('cant login before confirm', async () => {
        const client = new TestClient(host);

        const email = 'test@te3.te';
        const pass = '1234';
        await client.register(email, pass);

        await loginExpectError(email, pass, needConfirmEmail);

        await User.update({ email }, { isConfirmed: true });

        await loginExpectError(email, '1', invalidLoginOrPass);

        const { data } = await client.login(email, pass);
        expect(data).toEqual({ login: null });
    });
});
