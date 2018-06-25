import { startServer } from '../src/startServer';
import { Server } from 'net';
const port = 4001;

export const setup = async () => {
    const server = await startServer(port);
    process.env.TEST_HOST = `http://localhost:${port}`;
    return server;
};

export const finish = (app: Server) => new Promise(resolve => app.close(resolve));
