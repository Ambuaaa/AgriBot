import { Logger } from 'winston';

declare const logger: Logger;
export const stream: { write: (message: string) => void };
export default logger; 