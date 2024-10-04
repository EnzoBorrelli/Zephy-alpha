"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../../base/classes/Command"));
const Category_1 = __importDefault(require("../../base/enums/Category"));
class DevOnly extends Command_1.default {
    constructor(client) {
        super(client, {
            name: "devonly",
            description: "dev only command",
            category: Category_1.default.Utilities,
            default_member_permissions: discord_js_1.PermissionsBitField.Flags.Administrator,
            dm_permission: false,
            cooldown: 3,
            options: [],
            dev: true
        });
    }
    Execute(interaction) {
        interaction.reply({ content: "dev comand has been ran", ephemeral: true });
    }
}
exports.default = DevOnly;
