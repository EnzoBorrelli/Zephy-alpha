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

export default class ReactionRoleRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "reaction-role.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const messageId = interaction.options.getString("message-id")!;
    const emoji = interaction.options.getString("emoji")!;
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;
    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });
    const reaction = await ReactionRole.findOne({
      guildId: interaction.guildId,
      messageId: messageId,
      emoji: emoji,
    });

    i18next.changeLanguage(guild?.preferedLang.toString());

    try {
      const message = await channel.messages.fetch(messageId);

      if (!reaction) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `${i18next.t(
                  "reactionrole.reaction_not_found"
                )} \n **Emoji:** ${emoji}`
              ),
          ],
          ephemeral: true,
        });
      } else {
        await ReactionRole.deleteOne({
          guildId: interaction.guildId,
          messageId: messageId,
          emoji: emoji,
        });
      }
      await message.reactions.cache.get(emoji)?.remove();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `${i18next.t("reactionrole.reaction_deleted")} \n **${i18next.t(
                "general.message_id"
              )}**${messageId} \n **Emoji:** ${emoji}`
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

  async Reaction(reaction: MessageReaction, user: User) {
    if (user.bot) return; // Ignore bot reactions

    const guild = reaction.message.guild;
    if (!guild) return console.log("This guild does not exist");

    const reactionRole = await ReactionRole.findOne({
      guildId: guild.id,
      messageId: reaction.message.id,
      emoji: reaction.emoji.name,
    });

    if (!reactionRole) return console.log("This reaction does not exist");

    try {
      const role = await guild.roles.fetch(reactionRole.roleId); // Fetch the role
      const member = await guild.members.fetch(user.id);

      if (role) {
        await member.roles.remove(role);
        console.log(`Role ${role.name} removed from ${member.user.tag}`);
      } else {
        console.log("I can't find the role");
      }

      if (!member) {
        console.log("I can't find the member");
      }
    } catch (error) {
      console.error("Error adding role:", error);
    }
  }
}