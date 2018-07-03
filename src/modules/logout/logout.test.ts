import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';
import { createTestConnection } from '../../../testSetup/createTestConnection';

const email = 'test@tet.te';
const password = '12345';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
beforeAll(async () => {
    conn = await createTestConnection();
    await User.create({
        email,
        password,
        isConfirmed: true
    }).save();
});

afterAll(async () => {
    await conn.close();
});

describe('logout', () => {
    const host = process.env.TEST_HOST as string;

    it('multiple session', async () => {
        const session1 = new TestClient(host);
        const session2 = new TestClient(host);

        await session1.login(email, password);
        await session2.login(email, password);

        expect(await session1.me()).toEqual(await session2.me());
        await session1.logout();
        expect(await session1.me()).toEqual(await session2.me());
    });

    it('can logout', async () => {
        const client = new TestClient(host);

        await client.login(email, password);
        const { data } = await client.logout();

        expect(data.logout).toBeTruthy();
        const { data: meResponse } = await client.me();

        expect(meResponse.me).toBeNull();
    });
});
