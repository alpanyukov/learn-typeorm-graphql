import { createConnection, getConnectionOptions } from 'typeorm';

export const createTypeOrmConnection = async () => {
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
    return await createConnection({ ...connectionOptions, name: 'default' });
};
