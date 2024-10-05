declare interface User {
    name: string;
    avatar: string;
    role: number;

    get isGM(): boolean;
    get character(): Actor | undefined;
}
