import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { getRandomCatGif } from './utils.js';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data, guild_id, member } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    } else if (name === 'cat') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${getRandomCatGif()}`,
        },
      });
    } else if (name === 'join') {
      // Fetch the full member data from Discord API to get the voice state
      const memberData = await fetch(`https://discord.com/api/v10/guilds/${guild_id}/members/${member.user.id}`, {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
        },
      }).then(res => res.json());

      const voiceChannelId = memberData?.voice?.channel_id;

      if (!voiceChannelId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You need to be in a voice channel for me to join!',
          },
        });
      }

      // Here you can handle joining the voice channel using your voice bot logic
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Joined the voice channel: ${voiceChannelId}`,
        },
      });
    }

    return res.status(400).json({ error: 'unknown command' });
  }

  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
