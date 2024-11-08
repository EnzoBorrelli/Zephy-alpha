import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import i18next from "i18next";
import supabase from "../../lib/db";

export default class ReactionRoleRemoveAll extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "reaction-role.remove-all",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const messageId = interaction.options.getString("message-id")!;
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;

    const { data: guild, error: guildError } = await supabase
      .from("guildconfig")
      .select("*")
      .eq("guildid", interaction.guildId)
      .single();

    if (guildError || !guild) {
      console.error(
        "Error fetching guild config or no config found:",
        guildError
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ Error fetching language preference for the guild."
            ),
        ],
        ephemeral: true,
      });
    }

    i18next.changeLanguage(guild.prefferedlang.toString());

    const { data: reaction, error: reactionError } = await supabase
      .from("reactionrole")
      .select("*")
      .eq("guildid", guild.guildid)
      .eq("messageid", messageId)
      .single();

    try {
      const message = await channel.messages.fetch(messageId);

      if (message.reactions.cache.size === 0) {
        return interaction.reply({
          content: "❌ There are no reactions to remove from this message.",
          ephemeral: true,
        });
      }

      if (reactionError || !reaction) {
        console.error(
          "Error fetching reaction config or no config found:",
          reactionError
        );
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                "❌ Error fetching language preference for the guild."
              ),
          ],
          ephemeral: true,
        });
      } else {
        const { data, error: deleteError } = await supabase
          .from("reactionrole")
          .delete()
          .eq("guildId", guild.guildId)
          .eq("messageId", messageId);

        if (deleteError) {
          console.error("Error deleting reaction role:", deleteError);
        } else {
          console.log("reaction role deleted:", data);
        }
      }
      await message.reactions.removeAll();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `${i18next.t(
                "reactionrole.all_reactions_deleted"
              )} \n **${i18next.t("general.message_id")}**${messageId}`
            ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`${i18next.t("general.error")} : ${error}`),
        ],
        ephemeral: true,
      });
    }
  }
}
