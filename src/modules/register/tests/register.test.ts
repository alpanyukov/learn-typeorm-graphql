import { request } from 'graphql-request';
import { User } from '../../../entity/User';
import { startServer } from '../../../startServer';

const email = 'test@te2.te';
const pass = '123';

const mutation = `
mutation {
    register(email: "${email}", password: "${pass}")
}
`;

const apiPort = 4001;
const host = `http://localhost:${apiPort}`;

beforeAll(() => startServer(apiPort));

test('Register user', async () => {
    const response = await request(host, mutation);
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toBe(email);
    expect(user.password).not.toBe(pass);
});
