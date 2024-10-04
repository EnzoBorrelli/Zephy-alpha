import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class ModUnban extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "mod.unban",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getString("target");
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const Embed = new EmbedBuilder().setColor("Green");

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ the reason can't be longer than 512 caracters"
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.guild?.bans.fetch(target!);
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ this user is not banned")],
        ephemeral: true,
      });
    }
    try {
      await interaction.guild?.bans.remove(target!);
    } catch{
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ an error ocurred, try again")],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [Embed.setDescription(`🔨 Unbanned ${target}`)],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            Embed.setAuthor({ name: `🔨 UnBan | ${target}` }).setDescription(
              `**Reason:** \`${reason}\``
            ),
          ],
        })
        .then(async (msg) => await msg.react("🔨"));
    }
    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });

    if (
      guild &&
      guild.logs?.moderation?.enabled &&
      guild.logs?.moderation?.channelId
    ) {
      (
        (await interaction.guild?.channels.fetch(
          guild.logs.moderation.channelId
        )) as TextChannel
      )?.send({
        embeds: [
          Embed.setAuthor({ name: `🔨 UnBan` })
            .setDescription(`**User:** ${target} **Reason:** \`${reason}\` `)
            .setTimestamp()
            .setFooter({
              text: `Actioned by ${interaction.user.tag} | ${interaction.user.id}`,
              iconURL: interaction.user.displayAvatarURL({ size: 64 }),
            }),
        ],
      });
    }
  }
}
