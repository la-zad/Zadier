const seconds = (sec: number): number => sec * 1000;
const minutes = (min: number): number => seconds(min * 60);
const hours = (hrs: number): number => minutes(hrs * 60);
const days = (da: number): number => hours(da * 24);

export class Duration {
    private constructor(public milliseconds: number) {}
    public static milliseconds = (nb: number): Duration => new Duration(nb);
    public static seconds = (nb: number): Duration => new Duration(seconds(nb));
    public static minutes = (nb: number): Duration => new Duration(minutes(nb));
    public static hours = (nb: number): Duration => new Duration(hours(nb));
    public static days = (nb: number): Duration => new Duration(days(nb));

    public get seconds(): number {
        return this.milliseconds / 1000;
    }
    public set seconds(nb: number) {
        this.milliseconds = seconds(nb);
    }

    public get minutes(): number {
        return this.seconds / 60;
    }
    public set minutes(nb: number) {
        this.milliseconds = minutes(nb);
    }

    public get hours(): number {
        return this.minutes / 60;
    }
    public set hours(nb: number) {
        this.milliseconds = hours(nb);
    }

    public get days(): number {
        return this.hours / 24;
    }
    public set days(nb: number) {
        this.milliseconds = days(nb);
    }

    public toString(): string {
        const d = Math.floor(this.days);
        const h = Math.floor(this.hours % 24);
        const m = Math.floor(this.minutes % 60);
        const s = Math.floor(this.seconds % 60);
        const ms = this.milliseconds % 1000;
        let str = '';
        const plural = (nb: number): string => (nb > 1 ? 's' : '');
        if (d > 0) str += `${d} jour${plural(d)} `;
        if (h > 0) str += `${h} heure${plural(h)} `;
        if (m > 0) str += `${m} minute${plural(m)} `;
        if (s > 0) str += `${s} seconde${plural(s)} `;
        if (ms > 0) str += `${ms}ms`;
        if (str === '') str = '0ms';
        return str.trimEnd();
    }
}
