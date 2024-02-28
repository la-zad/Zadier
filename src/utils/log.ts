import { FunctionInfo } from './stack';

export class LogLevel {
    private level: number = 0;
    public constructor(level: number) {
        this.level = level;
    }
    public isTrace(): boolean {
        return this.level >= 0;
    }
    public isInfo(): boolean {
        return this.level >= 1;
    }
    public isWarn(): boolean {
        return this.level >= 2;
    }
    public isError(): boolean {
        return this.level >= 3;
    }
    public static TRACE = new LogLevel(0);
    public static INFO = new LogLevel(1);
    public static WARN = new LogLevel(2);
    public static ERROR = new LogLevel(3);
    toString(): string {
        switch (this.level) {
            case 0:
                return 'TRACE';
            case 1:
                return 'INFO';
            case 2:
                return 'WARN';
            case 3:
                return 'ERROR';
            default:
                return 'UNKNOWN';
        }
    }
}

class Logger {
    public display_level: LogLevel = LogLevel.INFO;
    private log(level: LogLevel, ...args: unknown[]): void {
        const now = new Date();
        const fnInfo = FunctionInfo.Get(3);
        const fnInfoStr = fnInfo ? `[${fnInfo.toString()}]` : '';
        console.log(now, '-', fnInfoStr, `${level.toString()}: `, ...args);
    }
    public trace(...args: unknown[]): void {
        if (this.display_level.isTrace()) {
            this.log(LogLevel.TRACE, ...args);
        }
    }
    public info(...args: unknown[]): void {
        if (this.display_level.isInfo()) {
            this.log(LogLevel.INFO, ...args);
        }
    }
    public warn(...args: unknown[]): void {
        if (this.display_level.isWarn()) {
            this.log(LogLevel.WARN, ...args);
        }
    }
    public error(...args: unknown[]): void {
        if (this.display_level.isError()) {
            this.log(LogLevel.ERROR, ...args);
        }
    }
}

export const LOG = new Logger();
