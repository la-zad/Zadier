interface EventEstimation {
    msg: 'estimation';
    rank: number;
    queue_size: number;
    avg_event_process_time: number;
    avg_event_concurrent_process_time: number;
    rank_eta: number;
    queue_eta: number;
}

interface EventSendData {
    msg: 'send_data';
    event_id: string;
}

interface EventProcessStart {
    msg: 'process_starts';
}

interface EventProcessCompleted {
    msg: 'process_completed';
    output?: Output;
    success: boolean;
}

export type Event = EventEstimation | EventSendData | EventProcessStart | EventProcessCompleted;

export interface Input {
    prompt: string;
    strength: number;
    steps: number;
    seed: number;
}

export interface InputData {
    session_hash: string;
    input: Input;
}

interface Output {
    data: OutputData[];
    is_generating: boolean;
    duration: number;
    average_duration: number;
}

interface OutputData {
    path: string;
    url: string | null;
    size: number | null;
    orig_name: string;
    mime_type: string | null;
}

export interface Attachment {
    name: string;
    attachment: Buffer;
}
