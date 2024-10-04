import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class Test extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "test",
      description: "test command",
      category: Category.Utilities,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
      options: [],
      dev:false
    });
  }
  Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "test comand has been ran", ephemeral: true });
  }
}
