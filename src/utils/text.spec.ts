import { describe, expect, it } from 'bun:test';

import { partition_text, PARTITIONING_PATTERNS } from './text';

describe('partition_text', () => {
    const INPUT = `Zadier, ton meilleur pote mais il respire pas. Un bot en TS. On l'aime bien... Car il est rempli de trolls.`;

    it('should be able to partition around sentences', () => {
        expect(partition_text(INPUT, 67, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            `Zadier, ton meilleur pote mais il respire pas. Un bot en TS.`,
            `On l'aime bien... Car il est rempli de trolls.`,
        ]);
    });

    it('should be able to partition a input smaller than partition size', () => {
        expect(partition_text(INPUT, 69420, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            `Zadier, ton meilleur pote mais il respire pas. Un bot en TS. On l'aime bien... Car il est rempli de trolls.`,
            ``,
        ]);

        const INPUT2 = `Zadier, ton meilleur pote mais il respire pas. Un bot en TS`;
        expect(partition_text(INPUT2, INPUT2.length, PARTITIONING_PATTERNS.END_OF_SENTENCE)).not.toStrictEqual([
            `Zadier, ton meilleur pote mais il respire pas.`,
            `Un bot en TS`,
        ]);
    });

    it('should be able to partition around suspension points', () => {
        expect(partition_text(INPUT, 80, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            `Zadier, ton meilleur pote mais il respire pas. Un bot en TS. On l'aime bien...`,
            `Car il est rempli de trolls.`,
        ]);
    });

    it('should hard partition if no match', () => {
        expect(partition_text('0123456789', 5, PARTITIONING_PATTERNS.END_OF_SENTENCE)).toStrictEqual([
            `01234`,
            `56789`,
        ]);
    });
});
