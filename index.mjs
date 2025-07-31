import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const blockedWords = ['badword1', 'badword2', 'anotherbadword'];

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  if (blockedWords.some(word => msg.includes(word))) {
    try {
      await message.delete();
      await message.channel.send(`${message.author}, language like that isn’t allowed here! ❌`);
    } catch (err) {
      console.error('Error deleting message or sending warning:', err);
    }
  }
});

client.login(process.env.TOKEN);
