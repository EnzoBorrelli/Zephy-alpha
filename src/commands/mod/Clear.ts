import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  Message,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import GuildConfig from "../../base/schemas/GuildConfig";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import i18next from "i18next";

export default class Clear extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "clear",
      description: "clear the channel",
      category: Category.Mod,
      default_member_permissions: PermissionsBitField.Flags.ManageMessages,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "amount",
          description: "Amount of messages to delete - Max: 100",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "target",
          description: "Select a user to delete messages from",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
        {
          name: "channel",
          description: "Select a channel to delete from",
          type: ApplicationCommandOptionType.Channel,
          required: false,
          channel_types: [ChannelType.GuildText],
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
    const amount = interaction.options.getInteger("amount")!;
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const Embed = new EmbedBuilder().setColor("Orange");

    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });

    i18next.changeLanguage(guild?.preferedLang.toString());

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("clear.amount_alert"))],
        ephemeral: true,
      });
    }

    const messages: Collection<
      String,
      Message<true>
    > = await channel.messages.fetch({ limit: 100 });

    var filterMessages = target
      ? messages.filter((m) => m.author.id === target.id)
      : messages;

    let deleted = 0;

    try {
      deleted = (
        await channel.bulkDelete(
          Array.from(filterMessages.values()).slice(0, amount),
          true
        )
      ).size;
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(i18next.t("clear.error"))],
        ephemeral: true,
      });
    }
    interaction.reply({
      embeds: [
        Embed.setDescription(
          `🧹 **${i18next.t("clear.deleted")}** \`${deleted}\` ${i18next.t(
            "clear.messages"
          )} ${
            target ? `${i18next.t("general.from")} ${target} ` : ""
          } ${i18next.t("general.in")} ${channel}`
        ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      channel
        .send({
          embeds: [
            Embed.setAuthor({ name: `🧹Clear | ${channel.name}` })
              .setDescription(
                `${i18next.t("clear.deleted")} \`${deleted}\` ${i18next.t(
                  "clear.messages"
                )}`
              )
              .setTimestamp()
              .setFooter({
                text: `${i18next.t("general.messages")} ${
                  target ? target.user.tag : `${i18next.t("general.all")}`
                } ${i18next.t("clear.messages")}`,
              }),
          ],
        })
        .then(async (msg) => await msg.react("🧹"));
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
          Embed.setAuthor({ name: `⌛ Clear` })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
            .setDescription(
              `**${i18next.t("general.channel")}** ${
                channel.name
              } \n **${i18next.t("general.messages")}** ${
                target ? target.user.tag : `${i18next.t("general.all")}`
              } ${i18next.t("clear.messages")}`
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
