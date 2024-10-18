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
const Event_1 = __importDefault(require("../../base/classes/Event"));
const ReactionRole_1 = __importDefault(require("../../base/schemas/ReactionRole"));
class Ready extends Event_1.default {
    constructor(client) {
        super(client, {
            name: discord_js_1.Events.ClientReady,
            description: "Ready Event",
            once: true,
        });
    }
    Execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log(`${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.tag} is now ready`);
            const clientId = this.client.developmentMode
                ? this.client.config.devDiscordClientId
                : this.client.config.discordClientId;
            const rest = new discord_js_1.REST().setToken(this.client.config.token);
            if (!this.client.developmentMode) {
                const globalCommands = yield rest.put(discord_js_1.Routes.applicationCommands(clientId), {
                    body: this.GetJson(this.client.commands.filter((command) => !command.dev)),
                });
                console.log(`succesfully set ${globalCommands.length} global app (/) commands.`);
            }
            const devCommands = yield rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, this.client.config.devGuildId), {
                body: this.GetJson(this.client.commands.filter((command) => command.dev)),
            });
            console.log(`succesfully set ${devCommands.length} dev app (/) commands.`);
            yield this.loadReactionRoles();
        });
    }
    GetJson(commands) {
        const data = [];
        commands.forEach((command) => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permission,
            });
        });
        return data;
    }
    loadReactionRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("im being summoned");
            try {
                const reactionRoles = yield ReactionRole_1.default.find();
                for (const reactionRole of reactionRoles) {
                    const guild = this.client.guilds.cache.get(reactionRole.guildId);
                    if (!guild) {
                        console.log("guild not found");
                        continue;
                    }
                    const channel = guild.channels.cache.get(reactionRole.channelId);
                    if (!channel) {
                        console.log("channel not found");
                        continue;
                    }
                    try {
                        const message = yield channel.messages.fetch(reactionRole.messageId);
                        if (message) {
                            console.log(`Loaded reaction role for message ${reactionRole.messageId} in guild ${guild.id}`);
                        }
                    }
                    catch (error) {
                        console.error(`Error loading message ${reactionRole.messageId}:`, error);
                    }
                }
            }
            catch (error) {
                console.error("Failed to load reaction roles on startup:", error);
            }
        });
    }
}
exports.default = Ready;
