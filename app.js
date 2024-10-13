import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { getRandomCatGif } from './utils.js';
import { joinVoiceChannel } from '@discordjs/voice';
import fetch from 'node-fetch'; // Use this to make API requests to Discord

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Make sure to include your bot token in the .env file

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data, guild_id, member } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where the command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    } else if (name === 'cat') {
      // Send a message into the channel where the command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random GIF to send from a helper function
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

      const voiceChannelId = memberData?.voice?.channel_id; // Get voice channel ID from the member's data

      if (!voiceChannelId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You need to be in a voice channel to use this command!',
          },
        });
      }

      // Get the guild object (for use with voice adapter)
      const guild = memberData.guild;

      try {
        // Join the voice channel
        const connection = joinVoiceChannel({
          channelId: voiceChannelId,
          guildId: guild_id,
          adapterCreator: guild.voiceAdapterCreator,
        });

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Joined the voice channel: ${voiceChannelId}`,
          },
        });
      } catch (error) {
        console.error(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to join the voice channel',
          },
        });
      }
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
