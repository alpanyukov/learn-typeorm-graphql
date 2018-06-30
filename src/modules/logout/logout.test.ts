import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';

const email = 'test@tet.te';
const password = '12345';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
beforeAll(async () => {
    conn = await createTypeOrmConnection();
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

    it('can logout', async () => {
        const client = new TestClient(host);

        await client.login(email, password);
        const { data } = await client.logout();

        expect(data.logout).toBeTruthy();
        const { data: meResponse } = await client.me();

        expect(meResponse.me).toBeNull();
    });
});
