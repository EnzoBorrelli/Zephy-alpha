import {
  PermissionsBitField,
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  Events,
  Guild,
  EmbedBuilder,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Emit extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "emit",
      description: "emit and event",
      category: Category.Dev,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 1,
      options: [
        {
          name: "event",
          description: "the event to emit",
          required: true,
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "GuildCreate", value: Events.GuildCreate },
            { name: "GuildDelete", value: Events.GuildDelete },
          ],
        },
      ],
      dev: true,
    });
  }
  Execute(interaction: ChatInputCommandInteraction) {
    const event = interaction.options.getString("event");

    if (event == Events.GuildCreate || event == Events.GuildDelete) {
      this.client.emit(event, interaction.guild as Guild);
    }
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`Emited Event \`${event}\``),
      ],
      ephemeral: true,
    });
  }
}
