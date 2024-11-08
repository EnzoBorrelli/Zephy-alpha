import dotenv from "dotenv"; // Mover la importación de dotenv al principio
dotenv.config(); // Cargar las variables de entorno

import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import Iconfig from "../interfaces/IConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { Config } from "../data/config";

export default class CustomClient extends Client implements ICustomClient {
  handler: Handler;
  config: Iconfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;
  developmentMode: boolean;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });
    this.config = Config;
    this.handler = new Handler(this);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.cooldowns = new Collection();
    this.developmentMode = process.argv.slice(2).includes("--development");
  }

  async init(): Promise<void> {
    console.log(
      `${this.developmentMode ? "development" : "production"} mode enabled`
    );

    // Verificar que las variables de entorno estén definidas
    if (!this.config.token) {
      console.error("Missing environment variables. Please check your .env file.");
      process.exit(1);
    }

    await this.initializeI18n();
    this.LoadHandlers();
    this.login(this.config.token).catch((err) => console.error(err));
  }

  LoadHandlers(): void {
    this.handler.LoadEvents();
    this.handler.LoadCommands();
  }

  async initializeI18n(): Promise<void> {
    await i18next.use(Backend).init({
      initImmediate: false,
      lng: "en",
      fallbackLng: "en",
      backend: {
        loadPath: "./src/locales/{{lng}}.json",
      },
      debug: true,
    });
    console.log("i18Next initialized with lang:", i18next.language);
  }
}
