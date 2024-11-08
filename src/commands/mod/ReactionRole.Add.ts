import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import i18next from "i18next";
import supabase from "../../lib/db";

export default class ReactionRoleAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "reaction-role.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const messageId = interaction.options.getString("message-id")!;
    const emoji = interaction.options.getString("emoji")!;
    const role = interaction.options
      .getRole("role")!
      .toString()
      .replace(/[<@&>]/g, "");
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    const { data: guild, error: guildError } = await supabase
      .from("guildconfig")
      .select("*")
      .eq("guildid", interaction.guildId)
      .single();

    if (guildError || !guild) {
      console.error(
        "Error fetching guild config or no config found:",
        guildError
      );
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Error fetching guild."),
        ],
      });
    }

    i18next.changeLanguage(guild.prefferedlang.toString());

    let { data: reaction, error: reactionError } = await supabase
      .from("reactionrole")
      .select("*")
      .eq("guildid", guild.guildid)
      .eq("messageid", messageId)
      .eq("emoji", emoji)
      .single();

    try {
      const message = await channel.messages.fetch(messageId);

      if (reactionError || !reaction) {
        const { data: newReaction, error: createError } = await supabase
          .from("reactionrole")
          .insert({
            guildid: guild.guildid,
            messageid: messageId,
            channelid: channel.id,
            emoji: emoji,
            roleid: role,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating logs entry:", createError);
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setDescription(
                  `${i18next.t("general.error")} : ${createError}`
                ),
            ],
          });
        }

        reaction = newReaction;
      } else {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Orange")
              .setDescription(
                `${i18next.t(
                  "reactionrole.existing_reaction"
                )} \n **Emoji:** ${emoji}`
              ),
          ],
        });
      }
      await message.react(emoji);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `${i18next.t("reactionrole.reaction_added")} \n **${i18next.t(
                "general.message_id"
              )}**${messageId} \n <@&${role}> -> ${emoji}`
            ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`${i18next.t("general.error")} : ${error}`),
        ],
      });
    }
  }

  async Reaction(reaction: MessageReaction, user: User) {
    if (user.bot) return; // Ignore bot reactions

    const guild = reaction.message.guild;
    if (!guild) return console.log("This guild does not exist");

    const { data: reactionRole, error: reactionError } = await supabase
      .from("reactionrole")
      .select("*")
      .eq("guildid", guild.id)
      .eq("messageid", reaction.message.id)
      .eq("emoji", reaction.emoji.name)
      .single();

    if (reactionError || !reaction) {
      console.error(
        "Error fetching reaction config or no config found:",
        reactionError
      );
    }

    if (!reactionRole) return console.log("This reaction does not exist");

    try {
      const role = await guild.roles.fetch(reactionRole.roleid); // Fetch the role
      const member = await guild.members.fetch(user.id);

      if (role) {
        await member.roles.add(role);
        console.log(`Role ${role.name} added to ${member.user.tag}`);
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
