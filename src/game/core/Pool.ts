/* eslint-disable @typescript-eslint/no-explicit-any */
// Pool uses any[] for maximum flexibility in object creation/reset functions

export class Pool<T> {
    private createFn: (...args: any[]) => T;
    private resetFn: (item: T, ...args: any[]) => void;
    private store: T[] = [];

    constructor(createFn: (...args: any[]) => T, resetFn: (item: T, ...args: any[]) => void) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.store = [];
    }

    public get(...args: any[]): T {
        if (this.store.length > 0) {
            const item = this.store.pop()!;
            this.resetFn(item, ...args);
            return item;
        }
        return this.createFn(...args);
    }

    public release(item: T) {
        this.store.push(item);
    }
}
