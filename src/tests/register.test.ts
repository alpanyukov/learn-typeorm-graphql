import { request } from 'graphql-request';
import { host } from './constants';
import { User } from '../entity/User';
import { createTypeOrmConnection } from '../utils/createTypeOrmConnection';

const email = 'test@te2.te';
const pass = '123';

const mutation = `
mutation {
    register(email: "${email}", password: "${pass}")
}
`;

beforeAll(createTypeOrmConnection);

test('Register user', async () => {
    const response = await request(host, mutation);
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toBe(email);
    expect(user.password).not.toBe(pass);
});
