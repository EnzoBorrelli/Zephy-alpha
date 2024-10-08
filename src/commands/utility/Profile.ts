import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { profileImage } from "discord-arts";

export default class Profile extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "profile",
      description: "Get an user profile",
      category: Category.Utilities,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "target",
          description: "Select a user",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
        {
          name: "tag",
          description: "Set a custom tag below the username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "show",
          description: "set the profile to show to other users",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
      dev: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = (interaction.options.getMember("target") ||
      interaction.member) as GuildMember;
    const tag = interaction.options.getString("tag") || target.user.tag;
    const show = interaction.options.getBoolean("show") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ User is not in the server")],
        ephemeral: true,
      });
    }
    if (tag.length > 16) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ the tag can't be longer than 16 caracters"
          ),
        ],
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });

    const buffer = await profileImage(target.id, {
      badgesFrame: true,
      removeAvatarFrame: false,
      presenceStatus: target.presence?.status,
      customDate: new Date(),
      customTag: tag,
    });

    const attachment = new AttachmentBuilder(buffer).setName(
      `${target.user.username
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace("v0.1", "v01")
        .replace(/[^a-z0-9-]/g, "")}_profile.png`
    );

    const color = (await target.user.fetch()).accentColor;

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(color ?? "Green")
          .setDescription(`Profile for ${target}`)
          .setImage(
            `attachment://${target.user.username
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace("v0.1", "v01")
              .replace(/[^a-z0-9-]/g, "")}_profile.png`
          ),
      ],
      files: [attachment],
    });

    if (show) {
      interaction.channel;
      await (interaction.channel as TextChannel)
        ?.send({
          embeds: [
            new EmbedBuilder()
              .setColor(color ?? "Green")
              .setDescription(`Profile for ${target}`)
              .setImage(
                `attachment://${target.user.username
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace("v0.1", "v01")
                  .replace(/[^a-z0-9-]/g, "")}_profile.png`
              ),
          ],
          files: [attachment],
        })
        .then(async (msg) => await msg.react("👀"));
    }
  }
}
