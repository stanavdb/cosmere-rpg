declare interface ChatMessage {
    speaker: ChatSpeakerData;
    author: User;
    timestamp: number;
    whisper: string[];
    rolls: Roll[];
}
