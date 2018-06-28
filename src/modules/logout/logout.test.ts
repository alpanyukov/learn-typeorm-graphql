import axios from 'axios';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection, TreeRepository } from 'typeorm';
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

const logoutMutation = `
mutation {
    logout 
}
`;

describe('logout', () => {
    const host = process.env.TEST_HOST as string;

    it('can logout', async () => {
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
                query: logoutMutation
            },
            { withCredentials: true }
        );

        expect(data.data.logout).toBeTruthy();

        const { data: meResponse } = await axios.post(
            host,
            {
                query: `
                {
                    me {
                        email,
                        id
                    }
                }
                `
            },
            { withCredentials: true }
        );

        expect(meResponse.data.me).toBeNull();
    });
});
