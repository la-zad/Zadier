import { describe, expect, it } from 'bun:test';

import { partition_text, PARTITIONING_PATTERNS } from './text';

describe('partition_text', () => {
    const INPUT = `Zadier, ton meilleur pote mais il respire pas. Un bot en TS. On l'aime bien... Car il est rempli de trolls.`;

    it('should be able to partition around sentences', () => {
        expect(partition_text(INPUT, 60, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            'Zadier, ton meilleur pote mais il respire pas. Un bot en TS.',
            `On l'aime bien... Car il est rempli de trolls.`,
        ]);
    });

    it('should be able to partition around suspension points', () => {
        expect(partition_text(INPUT, 80, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            `Zadier, ton meilleur pote mais il respire pas. Un bot en TS. On l'aime bien...`,
            `Car il est rempli de trolls.`,
        ]);
    });
});
