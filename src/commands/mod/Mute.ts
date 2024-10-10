import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import GuildConfig from "../../base/schemas/GuildConfig";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import ms from "ms";
import i18next from "i18next";

export default class Mute extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "mute",
      description: "Mute the users of the server",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.MuteMembers,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user to mute",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "duration",
          description: "Set a duration for this mute",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            { name: "5 minutes", value: "5m" },
            { name: "15 minutes", value: "15m" },
            { name: "30 minutes", value: "30m" },
            { name: "1 hour", value: "1h" },
            { name: "2 hours", value: "2h" },
            { name: "4 hours", value: "4h" },
            { name: "8 hours", value: "8h" },
            { name: "16 hours", value: "16h" },
            { name: "1 day", value: "1d" },
            { name: "2 days", value: "2d" },
            { name: "4 days", value: "4d" },
            { name: "1 week", value: "1w" },
            { name: "2 weeks", value: "2w" },
          ],
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
    const duration = interaction.options.getString("duration") || "5m";
    const msDuration = ms(duration);
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const Embed = new EmbedBuilder().setColor("Blue");

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
    if (
      target.communicationDisabledUntil != null &&
      target.communicationDisabledUntil > new Date()
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ ${target} ${i18next.t(
              "mute.already_muted"
            )} \`${target.communicationDisabledUntil.toLocaleString()}\``
          ),
        ],
        ephemeral: true,
      });
    }

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.reason"))],
        ephemeral: true,
      });
    }

    try {
      await target.send({
        embeds: [
          Embed.setDescription(
            `⌛ ${i18next.t("mute.dm_muted")} \`${
              interaction.guild?.name
            }\` ${i18next.t("general.by")} ${
              interaction.member
            }, \n ${i18next.t("general.reason")}[${reason}] \n **${i18next.t(
              "general.duration"
            )}** \`${duration}\``
          ).setThumbnail(target.displayAvatarURL({ size: 64 })),
        ],
      });
    } catch {}

    try {
      await target.timeout(msDuration, reason);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.error"))],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [Embed.setDescription(`⌛ Mute ${target}`)],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            Embed.setAuthor({ name: `⌛ Mute | ${target}` }).setDescription(
              `** ${i18next.t(
                "general.reason"
              )}** \`${reason}\` \n ** ${i18next.t("mute.expires")}** <t:${(
                (Date.now() + msDuration) /
                1000
              ).toFixed(0)}:F>`
            ),
          ],
        })
        .then(async (msg) => await msg.react("⌛"));
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
          Embed.setAuthor({ name: `⌛ Mute` })
            .setDescription(
              `** ${i18next.t("general.user")}** ${target} \n ** ${i18next.t(
                "general.reason"
              )}** \`${reason}\` \n ** ${i18next.t("mute.expires")}** <t:${(
                (Date.now() + msDuration) /
                1000
              ).toFixed(0)}:F> `
            )
            .setTimestamp()
            .setFooter({
              text: ` ${i18next.t("general.action")} ${
                interaction.user.tag
              } | ${interaction.user.id}`,
              iconURL: interaction.user.displayAvatarURL({ size: 64 }),
            }),
        ],
      });
    }
  }
}
