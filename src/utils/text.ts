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
    let lastPoint = text.length;
    do {
        lastPoint = text.slice(0, lastPoint).search(pattern);
    } while (lastPoint > max_length);
    if (lastPoint == -1) return [text.slice(0, max_length), text.slice(max_length)];

    return [text.slice(0, lastPoint + 1), text.slice(lastPoint + 1)];
}
