import { model, Schema } from "mongoose";

interface IReactionRole {
  guildId: string;
  messageId: string;
  channelId:string;
  emoji: string;
  roleId: string;
}

export default model<IReactionRole>(
  "ReactionRole",
  new Schema<IReactionRole>(
    {
      guildId: String,
      messageId: String,
      channelId:String,
      emoji: String,
      roleId: String,
    },
    {
      timestamps: true,
    }
  )
);
