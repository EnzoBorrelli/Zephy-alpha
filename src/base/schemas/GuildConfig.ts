import { model, Schema } from "mongoose";

interface IGuildConfig {
  guildId: string;
  preferedLang: String;
  logs: {
    moderation: {
      enabled: boolean;
      channelId: string;
    };
  };
}

export default model<IGuildConfig>(
  "GuildConfig",
  new Schema<IGuildConfig>(
    {
      guildId: String,
      preferedLang: String,
      logs: {
        moderation: {
          enabled: Boolean,
          channelId: String,
        },
      },
    },
    {
      timestamps: true,
    }
  )
);
