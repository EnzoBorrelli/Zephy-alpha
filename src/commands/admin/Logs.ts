import {
  PermissionsBitField,
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  ChannelType,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Logs extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs",
      description: "Configure logs for the server",
      category: Category.Admin,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "toggle",
          description: "toggle the logs for the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "log-type",
              description: "Type of log to toggle",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: "Mod Logs",
                  value: "moderation",
                },
              ],
            },
            {
              name: "toggle",
              description: "toggle the log",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
          ],
        },
        {
          name: "set",
          description: "set the logs channel for the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "log-type",
              description: "Type of log to set",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: "Mod Logs",
                  value: "moderation",
                },
              ],
            },
            {
              name: "channel",
              description: "channel to set the logs to",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types:[ChannelType.GuildText]
            },
          ],
        },
      ],
      dev: false,
    });
  }
  Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "test comand has been ran", ephemeral: true });
  }
}
