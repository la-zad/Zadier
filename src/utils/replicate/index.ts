import { ENV } from '@env';
import Replicate from 'replicate';

export const replicate = new Replicate({
    auth: ENV.REPLICATE_TOKEN,
});

export function check_authentication(): boolean {
    return !!replicate.auth;
}
