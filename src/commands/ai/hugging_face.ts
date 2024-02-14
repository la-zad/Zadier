export interface EventEstimation {
    msg: 'estimation';
    rank: number;
    queue_size: number;
    avg_event_process_time: number;
    avg_event_concurrent_process_time: number;
    rank_eta: number;
    queue_eta: number;
}
export interface EventSendData {
    msg: 'send_data';
    event_id: string;
}
export interface EventProcessStart {
    msg: 'process_starts';
}
export interface EventProcessCompleted {
    msg: 'process_completed';
    output?: Output;
    success: boolean;
}

export type Event = EventEstimation | EventSendData | EventProcessStart | EventProcessCompleted;

export interface Input {
    session_hash: string;

    prompt: string;
    strength: number;
    steps: number;
    seed: number;
}

export interface Output {
    data: OutputData[];
    is_generating: boolean;
    duration: number;
    average_duration: number;
}

export interface OutputData {
    path: string;
    url: string | null;
    size: number | null;
    orig_name: string;
    mime_type: string | null;
}

export async function send_data<T>(event_id: string, session_hash: string, data: T): Promise<boolean> {
    const res = await fetch('https://diffusers-unofficial-sdxl-turbo-i2i-t2i.hf.space/queue/data', {
        method: 'POST',
        body: JSON.stringify({
            data,
            event_id,
            event_data: null,
            fn_index: 1,
            trigger_id: 5,
            session_hash,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.status == 200;
}
