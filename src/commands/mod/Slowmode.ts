import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Slowmode extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "slowmode",
      description: "set the slowmode for a channel",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.ManageChannels,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "time",
          description: "set the time span between messages",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          choices: [
            { name: "none", value: "0" },
            { name: "5 seconds", value: "5" },
            { name: "10 seconds", value: "10" },
            { name: "15 seconds", value: "15" },
            { name: "30 seconds", value: "30" },
            { name: "1 Minute", value: "60" },
            { name: "2 Minutes", value: "120" },
            { name: "5 Minutes", value: "300" },
            { name: "10 Minutes", value: "600" },
            { name: "15 Minutes", value: "900" },
            { name: "30 Minutes", value: "1800" },
            { name: "1 Hour", value: "3600" },
            { name: "2 Hours", value: "7200" },
            { name: "6 Hours", value: "21600" },
          ],
        },
        {
          name: "channel",
          description: "Select a channel for the slowmode",
          type: ApplicationCommandOptionType.Channel,
          required: false,
          channel_types: [ChannelType.GuildText],
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
    const timeSpan = interaction.options.getInteger("time")!;
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;
    const reason =
      interaction.options.getString("reason") || "no reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const Embed = new EmbedBuilder().setColor("Green");

    if (timeSpan < 0 || timeSpan > 21600) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ You can only set an slowmode between 0 seconds and 6 hours"
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
      channel.setRateLimitPerUser(timeSpan, reason);
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription("❌ An error ocurred, please try again"),
        ],
        ephemeral: true,
      });
    }
    interaction.reply({
      embeds: [
        Embed.setDescription(
          `⏲ slowmode set to \`${timeSpan}\` seconds in ${channel}`
        ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      channel
        .send({
          embeds: [
            Embed.setAuthor({ name: `⏲Slowmode | ${channel.name}` })
              .setDescription(
                `⏲ slowmode set to \`${timeSpan}\` seconds  \n  **Reason:** \`${reason}\``
              )
              .setTimestamp()
              .setFooter({
                text: `Channel: ${channel.name}`,
              }),
          ],
        })
        .then(async (msg) => await msg.react("⏲"));
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
          Embed.setAuthor({ name: `⏲Slowmode` })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
            .setDescription(
              `**Channel:** ${channel.name} **Time:** \`${timeSpan}\` seconds \n  **Reason:** \`${reason}\``
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
