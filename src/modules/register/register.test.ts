import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { duplicateEmail, passwordMinLength, emailNotValid } from './errorMessages';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';

const email = 'test@te2.te';
const pass = '1234';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
beforeAll(async () => {
    conn = await createTypeOrmConnection();
});

afterAll(async () => {
    await conn.close();
});

const mutation = (email: string, pass: string) => `
mutation {
    register(email: "${email}", password: "${pass}") {
        path,
        message
    }
}
`;

describe('user registration', () => {
    it('register success', async () => {
        const response = await request(process.env.TEST_HOST as string, mutation(email, pass));
        expect(response).toEqual({ register: null });
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toBe(email);
        expect(user.password).not.toBe(pass);
    });

    it('cant register twice', async () => {
        await request(process.env.TEST_HOST as string, mutation(email, pass));
        const response = await request(process.env.TEST_HOST as string, mutation(email, pass));
        expect(response).toMatchObject({
            register: [{ message: duplicateEmail, path: 'email' }]
        });
    });

    it('password length more then 3', async () => {
        const response = await request(process.env.TEST_HOST as string, mutation(email, '12'));
        expect(response).toMatchObject({
            register: [{ path: 'password', message: passwordMinLength(3) }]
        });
    });

    it('email is validating', async () => {
        const response = await request(
            process.env.TEST_HOST as string,
            mutation('1231231432r', pass)
        );
        expect(response).toMatchObject({
            register: [{ path: 'email', message: emailNotValid }]
        });
    });
});
