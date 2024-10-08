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

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ You can only delete between 1 and 100 messages at a time"
          ),
        ],
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
        embeds: [
          errorEmbed.setDescription(
            "❌ An error ocurred while trying to delete the messages"
          ),
        ],
        ephemeral: true,
      });
    }
    interaction.reply({
      embeds: [
        Embed.setDescription(
          `🧹 **Deleted** \`${deleted}\` messages ${
            target ? `from ${target} ` : ""
          } in ${channel}`
        ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      channel
        .send({
          embeds: [
            Embed.setAuthor({ name: `🧹Clear | ${channel.name}` })
              .setDescription(`Deleted \`${deleted}\` messages`)
              .setTimestamp()
              .setFooter({
                text: `Messages: ${target ? target.user.tag : "All"} messages`,
              }),
          ],
        })
        .then(async (msg) => await msg.react("🧹"));
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
          Embed.setAuthor({ name: `⌛ Clear` })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
            .setDescription(
              `**Channel:** ${channel.name} \n **Messages:** ${
                target ? target.user.tag : "All"
              } messages`
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
