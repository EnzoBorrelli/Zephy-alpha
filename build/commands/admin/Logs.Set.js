"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const SubCommand_1 = __importDefault(require("../../base/classes/SubCommand"));
const GuildConfig_1 = __importDefault(require("../../base/schemas/GuildConfig"));
class LogsSet extends SubCommand_1.default {
    constructor(client) {
        super(client, {
            name: "logs.set",
        });
    }
    Execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const logType = interaction.options.getString("log-type");
            const channel = interaction.options.getChannel("channel");
            yield interaction.deferReply({ ephemeral: true });
            try {
                let guild = yield GuildConfig_1.default.findOne({ guildId: interaction.guildId });
                if (!guild) {
                    guild = yield GuildConfig_1.default.create({ guildId: interaction.guildId });
                }
                //@ts-ignore
                guild.logs[`${logType}`].channelId = channel.id;
                yield guild.save();
                return interaction.editReply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("Green")
                            .setDescription(`✔ Updated \`${logType}\` logs to send to ${channel}`),
                    ],
                });
            }
            catch (error) {
                console.error(error);
                return interaction.editReply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("Red")
                            .setDescription("❌ there was an error, try again"),
                    ],
                });
            }
        });
    }
}
exports.default = LogsSet;
