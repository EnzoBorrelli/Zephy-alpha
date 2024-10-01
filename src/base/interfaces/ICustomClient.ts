import { Collection } from "discord.js";
import Iconfig from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";

export default interface ICustomClient {
  config: Iconfig;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string,number>>;
  init(): void;
  LoadHandlers(): void;
}
