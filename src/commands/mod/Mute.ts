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

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ User is not in the server")],
        ephemeral: true,
      });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ You can't mute yourself")],
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
            "❌ you can't mute an user with higher roles"
          ),
        ],
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
            `❌ ${target} is already muted until \`${target.communicationDisabledUntil.toLocaleString()}\``
          ),
        ],
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

    try {
      await target.send({
        embeds: [
          Embed.setDescription(
            `⌛ You were muted from \`${interaction.guild?.name}\` by ${interaction.member} \n **Reason:** \`${reason}\` \n **Duration:** \`${duration}\``
          ).setThumbnail(target.displayAvatarURL({ size: 64 })),
        ],
      });
    } catch {}

    try {
      await target.timeout(msDuration, reason);
    } catch (error) {
      console.error(error)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("An error ocurred, try again")],
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
              `**Reason:** \`${reason}\` \n **Expires:** <t:${(
                (Date.now() + msDuration) /
                1000
              ).toFixed(0)}:F>`
            ),
          ],
        })
        .then(async (msg) => await msg.react("⌛"));
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
          Embed.setAuthor({ name: `⌛ Mute` })
            .setDescription(
              `**User:** ${target} \n **Reason:** \`${reason}\` \n **Expires:** <t:${(
                (Date.now() + msDuration) /
                1000
              ).toFixed(0)}:F> `
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
