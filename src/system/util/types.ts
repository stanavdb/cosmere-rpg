// export type ConstructorOf<T extends new (...args: any[]) => any> = new(...args: ConstructorParameters<T>) => T;
export type ConstructorOf<T> = new (...args: unknown[]) => T;
