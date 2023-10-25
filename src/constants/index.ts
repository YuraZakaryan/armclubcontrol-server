import * as process from 'process';

const PRIVATE_KEY_ACCESS: string = process.env.PRIVATE_KEY_ACCESS;
const PRIVATE_KEY_REFRESH: string = process.env.PRIVATE_KEY_REFRESH;

export { PRIVATE_KEY_REFRESH, PRIVATE_KEY_ACCESS };
