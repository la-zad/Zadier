import { EventReader } from './cmd_handler';

export { EventReader };

export const MAX_SEED_API = 12013012031030;

export const DEFAULT_VALUE = {
    strength: 0.7,
    steps: 2,
    get seed(): number {
        return Math.floor(Math.random() * MAX_SEED_API);
    },
};
