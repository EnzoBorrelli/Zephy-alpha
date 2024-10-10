import {
  PermissionsBitField,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import ms from "ms";
import GuildConfig from "../../base/schemas/GuildConfig";
import i18next from "i18next";

export default class Ban extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban",
      description: "ban the users of the server",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.BanMembers,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user to ban",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "reason",
          description: "Provide a reason",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "silent",
          description: "Dont send a message to the channel",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
      dev: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });

    i18next.changeLanguage(guild?.preferedLang.toString());

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("mod.user_not_found"))],
        ephemeral: true,
      });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("mod.autoban_alert"))],
        ephemeral: true,
      });
    }
    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    ) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("mod.role_alert"))],
        ephemeral: true,
      });
    }
    if (!target.bannable) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("mod.user_not_moderatable"))],
        ephemeral: true,
      });
    }
    if (reason.length > 512) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            i18next.t("general.reason_alert")
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
              `🔨 ${i18next.t("ban.dm_banned")} \`${
                interaction.guild?.name
              }\` ${i18next.t("general.by")} ${
                interaction.member
              }, \n ${i18next.t("general.reason")}[${reason}]`
            )
            .setImage(interaction.guild?.iconURL({})!),
        ],
      })
      .catch();

    try {
      await target?.ban({ deleteMessageSeconds: 0, reason: reason });
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.error"))],
        ephemeral: true,
      });
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
                `**${i18next.t("general.reason")}** \`${reason}\` `
              ),
          ],
        })
        .then(async (msg) => await msg.react("🔨"));
    }

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
              `**${i18next.t("general.user")}** ${target} - \`${
                target.id
              }\` \n **${i18next.t("general.reason")}** \`${reason}\` `
            )
            .setTimestamp()
            .setFooter({
              text: `${i18next.t("general.action")} ${interaction.user.tag} | ${interaction.user.id}`,
              iconURL: interaction.user.displayAvatarURL({ size: 64 }),
            }),
        ],
      });
    }
  }
}
