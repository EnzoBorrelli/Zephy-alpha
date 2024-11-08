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
      let { data: guild, error: fetchError } = await supabase
        .from("guildconfig")
        .select("*")
        .eq("guildid", interaction.guildId)
        .single();

      if (fetchError) {
        console.error("Error fetching guild config:", fetchError);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ there was an error, try again"),
          ],
        });
      }

      // If guild config doesn't exist, create it
      if (!guild) {
        const { data: newGuild, error: insertError } = await supabase
          .from("guildconfig")
          .insert([{ guildid: interaction.guildId }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating guild config:", insertError);
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription("❌ there was an error, try again"),
            ],
          });
        }

        guild = newGuild;
      }

      const { error: updateError } = await supabase
        .from("guildconfig")
        .update({ prefferedlang: lang })
        .eq("id", guild.id);

      if (updateError) {
        console.error("Error creating guild config:", updateError);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ there was an error, try again"),
          ],
        });
      }

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
