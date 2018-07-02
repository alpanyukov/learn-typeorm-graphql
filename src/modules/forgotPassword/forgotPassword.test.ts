import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import * as Redis from 'ioredis';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';

const email = 'test@tet.te';
const password = '12345';
const newPassword = '54321';
const redis = new Redis();

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
let userId: string;
beforeAll(async () => {
    conn = await createTypeOrmConnection();
    const user = await User.create({
        email,
        password,
        isConfirmed: true
    }).save();
    userId = user.id;
});

afterAll(async () => {
    await conn.close();
});

describe('forgot password', () => {
    const host = process.env.TEST_HOST as string;
    it('works', async () => {
        const client = new TestClient(host);

        const url = await createForgotPasswordLink('', userId, redis);
        const parts = url.split('/');
        const key = parts[parts.length - 1];
        const { data } = await client.forgotPasswordChange(newPassword, key);
        expect(data).toEqual({
            forgotPasswordChange: null
        });

        expect(await client.login(email, newPassword)).toEqual({
            data: {
                login: null
            }
        });
        // expect(await client.me()).toEqual({
        //     data: {
        //         me: {
        //             id: userId,
        //             email
        //         }
        //     }
        // });
    });
});
