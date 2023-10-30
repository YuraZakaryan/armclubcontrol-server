import * as process from 'process';

const PRIVATE_KEY_ACCESS: string = process.env.PRIVATE_KEY_ACCESS;
const PRIVATE_KEY_REFRESH: string = process.env.PRIVATE_KEY_REFRESH;

const EXPIRE_TIME_REFRESH = 7;
const EXPIRE_TIME_ACCESS = 86400;

export {
  PRIVATE_KEY_REFRESH,
  PRIVATE_KEY_ACCESS,
  EXPIRE_TIME_REFRESH,
  EXPIRE_TIME_ACCESS,
};
