import Iconfig from "../interfaces/IConfig";

export const Config : Iconfig = {
    token: process.env.TOKEN?.toString()!,
    discordClientId: process.env.DISCORD_CLIENT_ID?.toString()!,
    mongoUrl: process.env.MONGO_URL?.toString()!,
    devGuildId: process.env.DEV_GUILD_ID?.toString()!,
    devUserIds: process.env.DEV_USER_IDS?.split(",")!,
}