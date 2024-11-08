import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import i18next from "i18next";
import supabase from "../../lib/db";

export default class Unban extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "unban",
      description: "Unban the users of the server",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.BanMembers,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user to unban",
          type: ApplicationCommandOptionType.String,
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
    const target = interaction.options.getString("target");
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const Embed = new EmbedBuilder().setColor("Green");

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

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            i18next.t("general.reason")
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.guild?.bans.fetch(target!);
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("ban.user_not_banned"))],
        ephemeral: true,
      });
    }
    try {
      await interaction.guild?.bans.remove(target!);
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("general.error"))],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [Embed.setDescription(`🔨 ${i18next.t("ban.user_unbanned")} ${target}`)],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            Embed.setAuthor({ name: `🔨 UnBan | ${target}` }).setDescription(
              `**${i18next.t("general.reason")}** \`${reason}\``
            ),
          ],
        })
        .then(async (msg) => await msg.react("🔨"));
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
          Embed.setAuthor({ name: `🔨 UnBan` })
            .setDescription(`**${i18next.t("general.user")}** ${target} \n **${i18next.t("general.reason")}** \`${reason}\` `)
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
