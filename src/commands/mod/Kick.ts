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
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import i18next from "i18next";
import supabase from "../../lib/db";

export default class Kick extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "kick",
      description: "kick the users of the server",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.KickMembers,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user to kick",
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
    const Embed = new EmbedBuilder().setColor("Orange");

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

    const {data:logs,error:logsError} = await supabase
    .from("logs")
    .select("*")
    .eq("guildconfigid", guild.id)
    .single();

    if (logsError || !logs) {
      console.error("Error fetching guild config or no config found:", logsError);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Error fetching language preference for the guild."),
        ],
        ephemeral: true,
      });
    }

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
    if (!target.kickable) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(i18next.t("mod.user_not_moderatable")),
        ],
        ephemeral: true,
      });
    }

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.reason_alert"))],
        ephemeral: true,
      });
    }

    try {
      await target.send({
        embeds: [
          Embed.setDescription(
            `🔨 ${i18next.t("kick.dm_kicked")} \`${
              interaction.guild?.name
            }\` ${i18next.t("general.by")} ${
              interaction.member
            }, \n ${i18next.t("general.reason")}[${reason}]`
          ).setThumbnail(target.displayAvatarURL({ size: 64 })),
        ],
      });
    } catch {}

    try {
      await target.kick(reason);
    } catch (error) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.error"))],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [Embed.setDescription(`👢 Kick ${target}`)],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            Embed.setAuthor({ name: `👢 Kick | ${target}` }).setDescription(
              `**${i18next.t("general.reason")}** \`${reason}\``
            ),
          ],
        })
        .then(async (msg) => await msg.react("👢"));
    }

    if (
      guild &&
      logs.enabled &&
      logs.channelid
    ) {
      (
        (await interaction.guild?.channels.fetch(
          logs.channelid
        )) as TextChannel
      )?.send({
        embeds: [
          Embed.setAuthor({ name: `👢 Kick` })
            .setDescription(
              `**${i18next.t("general.user")}** ${target} \n **${i18next.t(
                "general.reason"
              )}** \`${reason}\` `
            )
            .setTimestamp()
            .setFooter({
              text: `${i18next.t("general.action")} ${interaction.user.tag} | ${
                interaction.user.id
              }`,
              iconURL: interaction.user.displayAvatarURL({ size: 64 }),
            }),
        ],
      });
    }
  }
}
