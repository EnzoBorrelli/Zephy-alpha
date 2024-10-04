import { PermissionsBitField, ApplicationCommandOptionType} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

  
  export default class Mod extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "mod",
        description: "moderate the users of the server",
        category: Category.Mod,
        default_member_permissions: PermissionsBitField.Flags.BanMembers,
        dm_permission: false,
        cooldown: 3,
        options: [
          {
            name: "ban",
            description: "Ban a user from the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "target",
                description: "Select a user to ban",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "Provide a reason",
                type: ApplicationCommandOptionType.String,
                required: false,
              },
              {
                name: "days",
                description: "delete user recent messages",
                type: ApplicationCommandOptionType.String,
                required: false,
                choices:[
                    {name: "none", value:"0"},
                    {name: "previous day", value:"1d"},
                    {name: "previous week", value:"7d"},
                ]
              },
              {
                name: "silent",
                description: "Dont send a message to the channel",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
              },
            ],
          },
          {
            name: "unban",
            description: "remove a ban from an user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "target",
                description: "Enter the user Id",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
              {
                name: "reason",
                description: "Provide a reason",
                type: ApplicationCommandOptionType.String,
                required: false,
              },
              {
                name: "silent",
                description: "Dont send a message to the channel",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
              },
            ],
          },
        ],
        dev: false,
      });
    }
  }
  