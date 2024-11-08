import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import supabase from "../../lib/db"; // Ensure you have configured the Supabase client

export default class LogsSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel") as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if guild config exists
      let { data: guild, error: fetchError } = await supabase
        .from("guildconfig")
        .select("*")
        .eq("guildid", interaction.guildId)
        .single();

      if (fetchError) {
        console.error("Error fetching guild config:", fetchError);
        return interaction.editReply({
          embeds: [this.createErrorEmbed("❌ Error fetching guild config.")],
        });
      }

      // If guild config doesn't exist, create it
      if (!guild) {
        const { data: newGuild, error: insertError } = await supabase
          .from("guildconfig")
          .insert({ guildid: interaction.guildId })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating guild config:", insertError);
          return interaction.editReply({
            embeds: [this.createErrorEmbed("❌ Error creating guild config.")],
          });
        }

        guild = newGuild;
      }

      // Check if logs entry exists for this guild config
      let { data: logs, error: logError } = await supabase
        .from("logs")
        .select("*")
        .eq("guildconfigid", guild.id)
        .single();


      // If logs entry doesn't exist, create it
      if (logError || !logs) {
        const { data: newLogs, error: insertError } = await supabase
          .from("logs")
          .insert({ guildconfigid: guild.id,enabled:true })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating logs entry:", insertError);
          return interaction.editReply({
            embeds: [this.createErrorEmbed("❌ Error creating logs entry.")],
          });
        }

        logs = newLogs;
      }

      // Update the channel ID for moderation logs
      const { error: updateError } = await supabase
        .from("logs")
        .update({ channelid: channel.id })
        .eq("id", logs.id);

      if (updateError) {
        console.error("Error updating channel ID:", updateError);
        return interaction.editReply({
          embeds: [this.createErrorEmbed("❌ Error updating channel ID.")],
        });
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✔ Moderation logs channel set to ${channel}`),
        ],
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return interaction.editReply({
        embeds: [this.createErrorEmbed("❌ An unexpected error occurred.")],
      });
    }
  }

  // Helper function for error embed creation
  private createErrorEmbed(description: string) {
    return new EmbedBuilder().setColor("Red").setDescription(description);
  }
}
