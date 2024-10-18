import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import i18next from "i18next";
import ReactionRole from "../../base/schemas/ReactionRole";

export default class ReactionRoleRemoveAll extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "reaction-role.remove-all",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const messageId = interaction.options.getString("message-id")!;
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;
    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });
    const reaction = await ReactionRole.find({
      guildId: interaction.guildId,
      messageId: messageId,
    });

    i18next.changeLanguage(guild?.preferedLang.toString());

    try {
      const message = await channel.messages.fetch(messageId);

      if (message.reactions.cache.size === 0) {
        return interaction.reply({
          content: "❌ There are no reactions to remove from this message.",
          ephemeral: true,
        });
      }

      if (!reaction) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `${i18next.t("reactionrole.message_not_found")} ${messageId}`
              ),
          ],
          ephemeral: true,
        });
      } else {
        await ReactionRole.deleteMany({
          guildId: interaction.guildId,
          messageId: messageId,
        });
      }
      await message.reactions.removeAll();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `${i18next.t("reactionrole.all_reactions_deleted")} \n **${i18next.t(
                "general.message_id"
              )}**${messageId}`
            ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`${i18next.t("general.error")} : ${error}`),
        ],
        ephemeral: true,
      });
    }
  }
}
