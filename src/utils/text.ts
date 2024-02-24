export type PARTITIONING_PATTERNS = (typeof PARTITIONING_PATTERNS)[keyof typeof PARTITIONING_PATTERNS];
export const PARTITIONING_PATTERNS = {
    END_OF_SENTENCE: /[.!?](\s|\n|$)/g,
    SPACE: / /g,
    PUNCTUATION: /[.,;?!]+/g,
    LINE_BREAK: /\n/g,
} as const;

/**
 * Partition a text to two parts.
 *
 * Returns a tuple with a first text of length <= `max_length` and a second text with the rest of the text.
 * The `pattern` is used to search for the end of the first part.
 * @param text the text input
 * @param max_length the max length of the first part
 * @param pattern the pattern to search.
 * @returns a tuple of the splited text
 */
export function partition_text(text: string, max_length: number, pattern: RegExp): [string, string] {
    const maxPartition = text.slice(0, max_length);
    // Ensure the 'g' flag is set
    if (!pattern.global) {
        pattern = new RegExp(pattern.source, `g${pattern.ignoreCase ? 'i' : ''}${pattern.multiline ? 'm' : ''}`);
    }

    let match, lastMatch;
    while ((match = pattern.exec(maxPartition)) !== null) lastMatch = match;

    if (!lastMatch) throw 'Uh Oh, what do we do?';

    const splitIndex = lastMatch.index + lastMatch.length;
    const partition = text.slice(0, splitIndex).trimEnd();
    const rest = text.slice(splitIndex).trimStart();

    return [partition, rest];
}
