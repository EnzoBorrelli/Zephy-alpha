export default interface Iconfig {
  token: string;
  discordClientId: string;
  mongoUrl:string

//for development
  devGuildId: string;
  devUserIds: string[]
}
