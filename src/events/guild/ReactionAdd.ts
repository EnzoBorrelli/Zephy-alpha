import { Events, MessageReaction, User } from "discord.js";
import Event from "../../base/classes/Event";
import CustomClient from "../../base/classes/CustomClient";

export default class ReactionAdd extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.MessageReactionAdd,
      description: "Reaction add Event",
      once: false,
    });
  }
  async Execute(reaction: MessageReaction, user: User) {
    if (user.bot) return; // Ignore reactions by bots

    // Log reaction and user details
    console.log(
      `Reaction added by ${user.tag} with emoji ${reaction.emoji.name}`
    );

    const command = this.client.commands.get("reaction-role");
    if (command) {
      const subcommand = this.client.subCommands.get("reaction-role.add");
      if (subcommand) subcommand.Reaction(reaction, user);
    }
  }
}
