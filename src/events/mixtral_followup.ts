import type { BotEvent } from '@events';
import type { Message } from 'discord.js';

interface MixtralMessage {
    author: 'bot' | 'user';
    content: string;
}
/**
 * Conversation between bot and user.
 */
class Conversation {
    private conversation: MixtralMessage[] = [];
    /**
     * Get messages thread from reply message until the first interaction command "ask_mixtral" is found
     * @param message the last message of the conversation
     */
    public static async from(message: Message): Promise<Conversation | Error> {
        const conversation = new Conversation();
        let last_msg = message;
        while (last_msg) {
            conversation.conversation.push({
                author: last_msg.author.id == message.client.user.id ? 'bot' : 'user',
                content: last_msg.content,
            });
            const ref = last_msg.reference?.messageId;
            if (ref == null) {
                //check for the first message interaction being a command ask_mixtral
                const first_msg = await last_msg.channel.messages.fetch(last_msg.id);
                if (first_msg.interaction?.commandName === 'ask_mixtral') {
                    // TODO: retrieve the command info
                    // const component = first_msg.resolveComponent(first_msg.interaction.id);
                    break;
                } else {
                    return new Error('Not a conversation from mixtral');
                }
            }
            last_msg = await last_msg.channel.messages.fetch(ref);
        }
        conversation.conversation.reverse();
        return conversation;
    }
    toString(): string {
        let text = '';
        for (const msg of this.conversation) text += `${msg.author}: ${msg.content}\n`;
        return text;
    }
}

/**
 * @event       - Mixtral followup
 * @listenTo    - messageCreate
 * @description - Create a new mixtral message when the user reply to a message from mixtral
 */
export const MIXTRAL_FOLLOWUP: BotEvent = {
    name: 'Mixtral followup',
    listenTo: 'messageCreate',
    once: false,
    async execute(message) {
        console.log('New message detected, Fetching conversation');
        if (message.reference?.messageId == null) return;
        const orig_msg = await message.channel.messages.fetch(message.reference.messageId);
        if (orig_msg.author.id !== message.client.user?.id) return;
        const conversation = await Conversation.from(message);
        if (conversation instanceof Error) return;
        console.log('Conversation found');
        console.log(conversation.toString());
    },
};
