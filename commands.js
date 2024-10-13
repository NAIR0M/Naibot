import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const CAT_COMMAND = {
  name: 'cat',
  description: 'Nya',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
/*const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};*/

const VOICE_COMMAND = {
  name: 'join',
  description: 'Join the voice channel',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  execute: async (interaction) => {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to use this command!');
    }

    try {
      await voiceChannel.join();
      return interaction.reply('Joined the voice channel!');
    } catch (error) {
      console.error(error);
      return interaction.reply('There was an error trying to join the voice channel!');
    }
  }
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, CAT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
