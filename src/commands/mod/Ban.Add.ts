import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import ms from "ms";

export default class BanAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const days = interaction.options.getString("days") || "0";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ User is not in the server")],
        ephemeral: true,
      });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ You can't ban yourself")],
        ephemeral: true,
      });
    }
    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ you can't ban an user with higher roles"
          ),
        ],
        ephemeral: true,
      });
    }
    if (!target.bannable) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ you can't ban this user")],
        ephemeral: true,
      });
    }
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
   await target
      ?.send({
        embeds: [
          errorEmbed
            .setDescription(
              `🔨 you were **banned** from \`${interaction.guild?.name}\` by ${interaction.member}, reason:[${reason}]`
            )
            .setImage(interaction.guild?.iconURL({})!),
        ],
      })
      .catch();

      try {
        await target?.ban({deleteMessageSeconds:ms(days),reason: reason})
      } catch {
        return interaction.reply({embeds:[errorEmbed.setDescription("❌ there was an error")]})
      }

    interaction.reply({
      embeds: [
        errorEmbed.setDescription(`🔨 banned ${target} - \`${target.id}\``),
      ],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            errorEmbed
              .setAuthor({ name: `🔨 Ban | ${target.user.tag}` })
              .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
              .setDescription(
                `**Reason:** \`${reason}\` ${
                  days
                    ? "0"
                    : `this user messages in the previous \`${days}\` have been deleted`
                }`
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
          errorEmbed
            .setAuthor({ name: `🔨 Ban` })
            .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
            .setDescription(
              `**User:** ${target} - \`${
                target.id
              }\` **Reason:** \`${reason}\` ${
                days
                  ? "0"
                  : `this user messages in the previous \`${days}\` have been deleted`
              }`
            )
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
