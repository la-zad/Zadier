import { Bot } from '@bot';
import { ENV } from '@env';

const BOT = new Bot(ENV.TOKEN, ENV.CLIENT_ID);

BOT.start().catch(console.error);
