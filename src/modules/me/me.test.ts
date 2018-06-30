import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';

let userId: string;
const email = 'test@tet.te';
const password = '12345';

// Придетсмя подождать пока выставиться соединение
// Иначе первый тест валится
let conn: Connection;
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

describe('me', () => {
    const host = process.env.TEST_HOST as string;

    it('cant get user if not logged in', async () => {
        const client = new TestClient(host);
        const { data, errors } = await client.me();

        expect(data.me).toBeNull();
        expect(errors).toHaveLength(1);
    });

    it('can get current user', async () => {
        const client = new TestClient(host);
        await client.login(email, password);
        const { data } = await client.me();

        expect(data).toEqual({ me: { email, id: userId } });
    });
});
