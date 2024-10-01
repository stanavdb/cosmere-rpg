declare interface User {
    role: number;

    get isGM(): boolean;
    get character(): Actor | undefined;
}
