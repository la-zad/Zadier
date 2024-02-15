import { ENV } from '@env';
import Replicate from 'replicate';

export const replicate = new Replicate({
    auth: ENV.REPLICATE_TOKEN,
});
