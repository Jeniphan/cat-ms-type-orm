import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      try {
        const dataSource = new DataSource({
          type: 'mysql',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
        });
        await dataSource.initialize(); // initialize the data source
        console.log('Database connected successfully');
        return dataSource;
      } catch (e) {
        console.log('Error connecting to database');
        throw e;
      }
    },
  },
];
