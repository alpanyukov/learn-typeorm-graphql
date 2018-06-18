import { startServer } from '../src/startServer';
const port = 4001;

export const setup = async () => {
    await startServer(port);
    process.env.TEST_HOST = `http://localhost:${port}`;
};
