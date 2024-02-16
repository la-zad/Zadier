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
        return (this.milliseconds / 1000) % 60;
    }
    public set seconds(nb: number) {
        this.milliseconds = seconds(nb);
    }

    public get minutes(): number {
        return (this.seconds / 60) % 60;
    }
    public set minutes(nb: number) {
        this.milliseconds = minutes(nb);
    }

    public get hours(): number {
        return (this.minutes / 60) % 24;
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
        return `${this.days}d ${this.hours}h ${this.minutes}m ${this.seconds}s`;
    }
}
