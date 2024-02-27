export class FunctionInfo {
    constructor(
        public name: string = '',
        public path: string = '',
        public line: number = 0,
        public column: number = 0,
    ) {}

    public static Get(level: number = 1): FunctionInfo | null {
        const err = new Error();
        if (!err.stack) return null;
        const listStack = err.stack.split('\n');
        const fn = listStack[level + 1];
        if (!fn) return null;
        const fnIndex = fn.indexOf('    at ');
        if (fnIndex == -1) return null;
        const fnInfo = fn.slice(fnIndex);

        const endFunctionName = fnInfo.indexOf(' (', 7);
        const endLine = fnInfo.lastIndexOf(')', endFunctionName);
        const source = fnInfo.slice(endFunctionName + 2, endLine);
        const posCol = source.lastIndexOf(':');
        const posLine = source.lastIndexOf(':', posCol - 1);
        const name = fnInfo.slice(7, endFunctionName);
        const path = source.slice(0, posLine);
        const line = Number.parseInt(source.slice(posLine + 1, posCol));
        const column = Number.parseInt(source.slice(posCol + 1));
        return new FunctionInfo(name, path, line, column);
    }
    public toString(): string {
        return `${this.name} (${this.path}:${this.line}:${this.column})`;
    }
}
