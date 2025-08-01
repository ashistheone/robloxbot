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

const COMMUNITY_ID = 53451410; // Your actual Roblox group ID

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith('-verify')) {
    const args = content.split(' ');
    if (args.length < 2) {
      return message.channel.send('Please provide your Roblox username. Example: `-verify beingblazee`');
    }

    const username = args[1];

    try {
      // Step 1: Get user ID
      const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username],
      });

      if (!userRes.data.data || userRes.data.data.length === 0) {
        return message.channel.send(`❌ User "${username}" not found on Roblox.`);
      }

      const userId = userRes.data.data[0].id;

      // Step 2: Check community membership
      const rolesRes = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
      const communityInfo = rolesRes.data.data.find(g => g.group.id === COMMUNITY_ID);

      if (!communityInfo) {
        return message.channel.send(`${message.author}, you are **not** in the community.`);
      }

      // Step 3: Try getting joined date
      const joined = communityInfo.joined;

      if (!joined) {
        return message.channel.send(`${message.author}, your community join date could not be found. Please wait a bit and try again later.`);
      }

      const joinedDate = new Date(joined);
      if (isNaN(joinedDate.getTime())) {
        return message.channel.send(`${message.author}, your community join date is invalid.`);
      }

      const now = new Date();
      const diffDays = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));

      if (diffDays >= 14) {
        return message.channel.send(`🎉 ${message.author}, you joined the community on **${joinedDate.toDateString()}** and have been here for **${diffDays} days**. You are **eligible** to buy Robux!`);
      } else {
        return message.channel.send(`${message.author}, you joined the community on **${joinedDate.toDateString()}** and have only been here for **${diffDays} days**.\nYou need **at least 14 days** to be eligible.`);
      }

    } catch (err) {
      console.error('❗ Verification Error:', err.message);
      return message.channel.send(`⚠️ ${message.author}, something went wrong during verification. Please try again later.`);
    }
  }
});

client.login(process.env.TOKEN);
