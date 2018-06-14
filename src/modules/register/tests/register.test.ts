import { request } from 'graphql-request';
import { User } from '../../../entity/User';
import { startServer } from '../../../startServer';
import { duplicateEmail, passwordMinLength, emailNotValid } from '../errorMessages';

const email = 'test@te2.te';
const pass = '1234';

const mutation = (email: string, pass: string) => `
mutation {
    register(email: "${email}", password: "${pass}") {
        path,
        message
    }
}
`;

const apiPort = 4001;
const host = `http://localhost:${apiPort}`;

beforeAll(() => startServer(apiPort));
describe('user registration', () => {
    it('register success', async () => {
        const response = await request(host, mutation(email, pass));
        expect(response).toEqual({ register: null });
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toBe(email);
        expect(user.password).not.toBe(pass);
    });

    it('cant register twice', async () => {
        await request(host, mutation(email, pass));
        const response = await request(host, mutation(email, pass));
        expect(response).toMatchObject({
            register: [{ message: duplicateEmail, path: 'email' }]
        });
    });

    it('password length more then 3', async () => {
        const response = await request(host, mutation(email, '12'));
        expect(response).toMatchObject({
            register: [{ path: 'password', message: passwordMinLength(3) }]
        });
    });

    it('email is validating', async () => {
        const response = await request(host, mutation('1231231432r', pass));
        expect(response).toMatchObject({
            register: [{ path: 'email', message: emailNotValid }]
        });
    });
});
