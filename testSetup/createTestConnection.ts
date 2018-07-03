import { getConnectionOptions, createConnection } from 'typeorm';

export const createTestConnection = async (resetDB = true) => {
    const conOptions = await getConnectionOptions(process.env.NODE_ENV);
    return createConnection({
        ...conOptions,
        name: 'default',
        synchronize: resetDB,
        dropSchema: resetDB
    });
};
