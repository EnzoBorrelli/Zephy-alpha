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
class BanRemove extends SubCommand_1.default {
    constructor(client) {
        super(client, {
            name: "ban.remove",
        });
    }
    Execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const target = interaction.options.getString("target");
            const reason = interaction.options.getString("reason") || "no reason provided";
            const silent = interaction.options.getBoolean("silent") || false;
            const errorEmbed = new discord_js_1.EmbedBuilder().setColor("Red");
            const Embed = new discord_js_1.EmbedBuilder().setColor("Green");
            if (reason.length > 512) {
                return interaction.reply({
                    embeds: [
                        errorEmbed.setDescription("❌ the reason can't be longer than 512 caracters"),
                    ],
                    ephemeral: true,
                });
            }
            try {
                yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.bans.fetch(target));
            }
            catch (_k) {
                return interaction.reply({
                    embeds: [errorEmbed.setDescription("❌ this user is not banned")],
                    ephemeral: true,
                });
            }
            try {
                yield ((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.bans.remove(target));
            }
            catch (_l) {
                return interaction.reply({
                    embeds: [errorEmbed.setDescription("❌ an error ocurred, try again")],
                    ephemeral: true,
                });
            }
            interaction.reply({
                embeds: [Embed.setDescription(`🔨 Unbanned ${target}`)],
                ephemeral: true,
            });
            if (!silent) {
                interaction.channel;
                yield ((_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.send({
                    embeds: [
                        Embed.setAuthor({ name: `🔨 UnBan | ${target}` }).setDescription(`**Reason:** \`${reason}\``),
                    ],
                }).then((msg) => __awaiter(this, void 0, void 0, function* () { return yield msg.react("🔨"); })));
            }
            const guild = yield GuildConfig_1.default.findOne({ guildId: interaction.guildId });
            if (guild &&
                ((_e = (_d = guild.logs) === null || _d === void 0 ? void 0 : _d.moderation) === null || _e === void 0 ? void 0 : _e.enabled) &&
                ((_g = (_f = guild.logs) === null || _f === void 0 ? void 0 : _f.moderation) === null || _g === void 0 ? void 0 : _g.channelId)) {
                (_j = ((yield ((_h = interaction.guild) === null || _h === void 0 ? void 0 : _h.channels.fetch(guild.logs.moderation.channelId))))) === null || _j === void 0 ? void 0 : _j.send({
                    embeds: [
                        Embed.setAuthor({ name: `🔨 UnBan` })
                            .setDescription(`**User:** ${target} **Reason:** \`${reason}\` `)
                            .setTimestamp()
                            .setFooter({
                            text: `Actioned by ${interaction.user.tag} | ${interaction.user.id}`,
                            iconURL: interaction.user.displayAvatarURL({ size: 64 }),
                        }),
                    ],
                });
            }
        });
    }
}
exports.default = BanRemove;
