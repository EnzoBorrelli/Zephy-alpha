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

export default class Unmute extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "unmute",
      description: "Unmute the users of the server",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.MuteMembers,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user to unmute",
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
    const Embed = new EmbedBuilder().setColor("Blue");

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ User is not in the server")],
        ephemeral: true,
      });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ You can't unmute yourself")],
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
            "❌ you can't unmute an user with higher roles"
          ),
        ],
        ephemeral: true,
      });
    }
    if (target.communicationDisabledUntil == null) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(`❌ ${target} is not muted at the moment`),
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
            `⌛ You were unmuted from \`${interaction.guild?.name}\` by ${interaction.member} \n  **Reason:** \`${reason}\``
          ).setThumbnail(target.displayAvatarURL({ size: 64 })),
        ],
      });
    } catch {}

    try {
      await target.timeout(null, reason);
    } catch (error) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("An error ocurred, try again")],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [Embed.setDescription(`⌛ UnMute ${target}`)],
      ephemeral: true,
    });
    if (!silent) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            Embed.setAuthor({ name: `⌛ UnMute | ${target}` }).setDescription(
              `**Reason:** \`${reason}\``
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
          Embed.setAuthor({ name: `⌛ UnMute` })
            .setDescription(`**User:** ${target} \n **Reason:** \`${reason}\``)
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