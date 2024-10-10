import {
  PermissionsBitField,
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import i18next from "i18next";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class SetLanguage extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "setlanguage",
      description: "set the language of the bot",
      category: Category.Admin,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "lang",
          description: "select the language",
          required: true,
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "English", value: "en" },
            { name: "Español", value: "es" },
          ],
        },
      ],
      dev: false,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const lang = interaction.options.getString("lang")!;
    await interaction.deferReply({ ephemeral: true });
    try {
      i18next.changeLanguage(lang);
      let guild = await GuildConfig.findOne({ guildId: interaction.guildId });
      if (!guild) {
        guild = await GuildConfig.create({ guildId: interaction.guildId });
      }
      guild.preferedLang = lang;
      await guild.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(i18next.t("language-set")),
        ],
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ there was an error, try again"),
        ],
      });
    }
  }
}
