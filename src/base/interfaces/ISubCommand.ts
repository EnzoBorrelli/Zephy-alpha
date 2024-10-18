import { ChatInputCommandInteraction, MessageReaction, User } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface ISubCommand {
  client: CustomClient;
  name: string;

  Execute(interaction: ChatInputCommandInteraction): void;
  Reaction(reaction: MessageReaction,user:User): void;
}
