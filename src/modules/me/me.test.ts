import axios from 'axios';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';

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

const loginMutation = (email: string, pass: string) => `
mutation {
    login(email: "${email}", password: "${pass}") {
        path,
        message
    }
}
`;

const meQuery = `
    {
        me {
            email,
            id
        }
    }
`;

describe('me', () => {
    const host = process.env.TEST_HOST as string;

    it('cant get user if not logged in', () => {});

    it('can get current user', async () => {
        await axios.post(
            host,
            {
                query: loginMutation(email, password)
            },
            { withCredentials: true }
        );

        const { data } = await axios.post(
            host,
            {
                query: meQuery
            },
            { withCredentials: true }
        );

        expect(data.data).toEqual({ me: { email, id: userId } });
    });
});
