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
import supabase from "../../lib/db";

export default class TestLang extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "testlang",
      description: "test language implementation",
      category: Category.Dev,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 1,
      options: [],
      dev: true,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const {data:guild,error:guildError} = await supabase
    .from("guildconfig")
    .select("*")
    .eq("guildid", interaction.guildId)
    .single();

    if (guildError || !guild) {
      console.error("Error fetching guild config or no config found:", guildError);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Error fetching language preference for the guild."),
        ],
        ephemeral: true,
      });
    }

    i18next.changeLanguage(guild.prefferedlang.toString());

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `Language set to \`${i18next.language}\` , ${i18next.t(
              "greeting"
            )} `
          ),
      ],
      ephemeral: true,
    });
  }
}
