import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class DevOnly extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "devonly",
      description: "dev only command",
      category: Category.Utilities,
      default_member_permissions:
        PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 3,
      options: [],
      dev:true
    });
  }
  Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "dev comand has been ran", ephemeral: true });
  }
}
