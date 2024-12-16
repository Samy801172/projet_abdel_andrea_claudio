// src/config/orm.config.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const configService = new ConfigService();

// Configuration commune
const commonConfig = {
  type: 'postgres' as const,
  host: configService.get('DB_HOST', 'localhost'), // Valeur par défaut
  port: configService.get('DB_PORT'),
  username: configService.get('pwd_user4001'),
  password: configService.get('P@ssword4001'),
  database: configService.get('pwd_ser4001'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsRun: true
};
console.log('Database Config:', {
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('pwd_user4001'),
  password: configService.get('P@ssword4001'),
  database: configService.get('pwd_ser4001'),
});
// Configuration pour DataSource (utilisée pour les migrations)
export default new DataSource(commonConfig);

// Configuration pour TypeORM Module (utilisée par NestJS)
export const typeOrmConfig: TypeOrmModuleOptions = {
  ...commonConfig,
  autoLoadEntities: true  // Option spécifique à NestJS
};