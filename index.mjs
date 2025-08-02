import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GROUP_ID = 53451410; // Your Roblox group ID

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith('-verify')) {
    const args = content.split(' ');
    if (args.length < 2) {
      return message.channel.send('Please provide your Roblox username. Example: `-verify RobloxUser123`');
    }

    const username = args[1];

    try {
      // New POST request to get user ID
      const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username]
      });

      if (!userRes.data.data || userRes.data.data.length === 0) {
        return message.channel.send(`User "${username}" not found on Roblox.`);
      }
      const userId = userRes.data.data[0].id;

      // Get group info
      const groupRes = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);

      const groupInfo = groupRes.data.data.find(g => g.group.id === GROUP_ID);

      if (!groupInfo) {
        return message.channel.send(`Hey ${message.author}, you are **not** in the Roblox group.`);
      }

      const joinedDate = new Date(groupInfo.joined);
      const now = new Date();
      const diffDays = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));

      if (diffDays >= 14) {
        return message.channel.send(`🎉 Congrats ${message.author}, you are **ELIGIBLE** to buy Robux!`);
      } else {
        return message.channel.send(`${message.author}, you need at least **14 days** in the group to be eligible.`);
      }
    } catch (error) {
      console.error(error);
      return message.channel.send('⚠️ Oops! Something went wrong while verifying your group membership.');
    }
  }
});

client.login(process.env.TOKEN);
