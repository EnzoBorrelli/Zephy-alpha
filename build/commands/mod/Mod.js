"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../../base/classes/Command"));
const Category_1 = __importDefault(require("../../base/enums/Category"));
class Mod extends Command_1.default {
    constructor(client) {
        super(client, {
            name: "mod",
            description: "moderate the users of the server",
            category: Category_1.default.Mod,
            default_member_permissions: discord_js_1.PermissionsBitField.Flags.BanMembers,
            dm_permission: false,
            cooldown: 3,
            options: [
                {
                    name: "ban",
                    description: "Ban a user from the server",
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "target",
                            description: "Select a user to ban",
                            type: discord_js_1.ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "Provide a reason",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: false,
                        },
                        {
                            name: "days",
                            description: "delete user recent messages",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: "none", value: "0" },
                                { name: "previous day", value: "1d" },
                                { name: "previous week", value: "7d" },
                            ]
                        },
                        {
                            name: "silent",
                            description: "Dont send a message to the channel",
                            type: discord_js_1.ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: "unban",
                    description: "remove a ban from an user",
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "target",
                            description: "Enter the user Id",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "Provide a reason",
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            required: false,
                        },
                        {
                            name: "silent",
                            description: "Dont send a message to the channel",
                            type: discord_js_1.ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
            ],
            dev: false,
        });
    }
}
exports.default = Mod;
