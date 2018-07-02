import { User } from '../../entity/User';
import { duplicateEmail, passwordMinLength, emailNotValid } from './errorMessages';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import { TestClient } from '../../utils/TestClient';

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

describe('user registration', () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    it('register success', async () => {
        const { data } = await client.register(email, pass);
        expect(data).toEqual({ register: null });
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toBe(email);
        expect(user.password).not.toBe(pass);
    });

    it('cant register twice', async () => {
        await client.register(email, pass);
        const { data } = await client.register(email, pass);

        expect(data).toMatchObject({
            register: [{ message: duplicateEmail, path: 'email' }]
        });
    });

    it('password length more then 3', async () => {
        const { data } = await client.register(email, '12');
        expect(data).toMatchObject({
            register: [{ path: 'password', message: passwordMinLength }]
        });
    });

    it('email is validating', async () => {
        const { data } = await client.register('1231231432r', pass);
        expect(data).toMatchObject({
            register: [{ path: 'email', message: emailNotValid }]
        });
    });
});
