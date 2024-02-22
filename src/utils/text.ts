export function shrink_text(text: string, max_length: number, pattern: RegExp): [string, string] {
    let lastPoint = text.length;
    do {
        lastPoint = text.slice(0, lastPoint).search(pattern);
    } while (lastPoint > max_length);
    if (lastPoint == -1) return [text.slice(0, max_length), text.slice(max_length)];

    return [text.slice(0, lastPoint + 1), text.slice(lastPoint + 1)];
}
