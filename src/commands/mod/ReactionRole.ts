import {
    PermissionsBitField,
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    ChannelType,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  
  export default class ReactionRole extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "reaction-role",
        description: "Configure the reaction roles for a message",
        category: Category.Mod,
        default_member_permissions: PermissionsBitField.Flags.ManageRoles,
        dm_permission: false,
        cooldown: 3,
        options: [
          {
            name: "add",
            description: "add a role reaction to message",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message-id",
                    description: "provide the message id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    name: "emoji",
                    description: "provide an emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    name: "role",
                    description: "provide a role",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                  },
                  {
                    name: "channel",
                    description: "Select the message channel",
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                    channel_types: [ChannelType.GuildText],
                  },
            ],
          },
          {
            name: "remove",
            description: "remove a role reaction from a message",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message-id",
                    description: "provide the message id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    name: "emoji",
                    description: "provide an emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    name: "channel",
                    description: "Select the message channel",
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                    channel_types: [ChannelType.GuildText],
                  },
            ],
          },
          {
            name: "remove-all",
            description: "remove all reations from a message",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message-id",
                    description: "provide the message id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    name: "channel",
                    description: "Select the message channel",
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                    channel_types: [ChannelType.GuildText],
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
  