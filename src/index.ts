import { Bot } from '@bot';
import { ENV } from '@env';

const BOT = new Bot(ENV.TOKEN, ENV.CLIENT_ID);

BOT.on('ready', (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
});

BOT.start().catch(console.error);
