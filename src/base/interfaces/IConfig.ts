export default interface Iconfig {
  token: string;
  discordClientId: string;
  mongoUrl:string

//for development
  devToken:string
  devDiscordClientId: string;
  devGuildId: string;
  devUserIds: string[]
  devMongoUrl:string
}
