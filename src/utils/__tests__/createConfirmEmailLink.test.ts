import { createConfirmEmailLink } from '../createConfirmEmailLink';
import { User } from '../../entity/User';
import * as Redis from 'ioredis';
import fetch from 'node-fetch';
import { Connection } from 'typeorm';
import { createTestConnection } from '../../../testSetup/createTestConnection';

let userId: string;

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;

beforeAll(async () => {
    conn = await createTestConnection();
    const user = await User.create({
        email: '123@qw3e@we',
        password: '12345'
    }).save();
    userId = user.id;
});

afterAll(async () => {
    await conn.close();
});

describe('createConfirmEmailLink', () => {
    const redis = new Redis(6379, 'localhost');

    it('show ok for correct userId', async () => {
        const link = await createConfirmEmailLink(process.env.TEST_HOST as string, userId, redis);
        const response = await fetch(link);
        const result = await response.text();
        expect(result).toBe('ok');
        const user = await User.findOne(userId);
        expect(user).toBeDefined();
        expect((user as User).isConfirmed).toBeTruthy();
    });
});
