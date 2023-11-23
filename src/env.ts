import type { Output } from 'valibot';
import { object, parse, regex, string } from 'valibot';

const ENV_SCHEMA = object({
    CLIENT_ID: string([regex(/^[0-9]{17,19}$/, 'Probably invalid client id.')]),
    TOKEN: string([regex(/^(mfa\.[\w-]{84}|[\w-]{24,}\.[\w-]{6}\.[\w-]{27,})$/, 'Probably invalid token.')]),
});

export const ENV = parse(ENV_SCHEMA, process.env);
export type ENV = Output<typeof ENV_SCHEMA>;
