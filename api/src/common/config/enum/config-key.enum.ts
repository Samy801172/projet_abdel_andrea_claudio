export enum ConfigKey {
  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USER = 'DB_USER',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_DATABASE = 'DB_DATABASE',
  JWT_TOKEN_SECRET = 'JWT_TOKEN_SECRET',
  JWT_TOKEN_EXPIRE_IN = 'JWT_TOKEN_EXPIRE_IN',
  JWT_REFRESH_TOKEN_SECRET = 'JWT_REFRESH_TOKEN_SECRET',
  JWT_REFRESH_TOKEN_EXPIRE_IN = 'JWT_REFRESH_TOKEN_EXPIRE_IN',
  APP_BASE_URL = 'APP_BASE_URL',
  APP_MODE = 'APP_MODE',
  APP_PORT = 'APP_PORT',
  DB_TYPE='DB_TYPE',
  DB_SYNC='DB_SYNC'

}
export const configMinimalKeys: ConfigKey[] = Object.keys(ConfigKey) as ConfigKey[];