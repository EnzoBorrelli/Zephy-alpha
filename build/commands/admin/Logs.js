"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../../base/classes/Command"));
const Category_1 = __importDefault(require("../../base/enums/Category"));
class Logs extends Command_1.default {
    constructor(client) {
        super(client, {
            name: "logs",
            description: "Configure logs for the server",
            category: Category_1.default.Admin,
            default_member_permissions: discord_js_1.PermissionsBitField.Flags.Administrator,
            dm_permission: false,
            cooldown: 3,
            options: [
                {
                    name: "toggle",
                    description: "toggle the logs for the server",
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "log-type",
                            description: "Type of log to toggle",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Mod Logs",
                                    value: "moderation",
                                },
                            ],
                        },
                        {
                            name: "toggle",
                            description: "toggle the log",
                            type: discord_js_1.ApplicationCommandOptionType.Boolean,
                            required: true,
                        },
                    ],
                },
                {
                    name: "set",
                    description: "set the logs channel for the server",
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "log-type",
                            description: "Type of log to set",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Mod Logs",
                                    value: "moderation",
                                },
                            ],
                        },
                        {
                            name: "channel",
                            description: "channel to set the logs to",
                            type: discord_js_1.ApplicationCommandOptionType.Channel,
                            required: true,
                            channel_types: [discord_js_1.ChannelType.GuildText]
                        },
                    ],
                },
            ],
            dev: false,
        });
    }
    Execute(interaction) {
        interaction.reply({ content: "test comand has been ran", ephemeral: true });
    }
}
exports.default = Logs;
