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
const ms_1 = __importDefault(require("ms"));
class BanAdd extends SubCommand_1.default {
    constructor(client) {
        super(client, {
            name: "ban.add",
        });
    }
    Execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const target = interaction.options.getMember("target");
            const reason = interaction.options.getString("reason") || "no reason provided";
            const days = interaction.options.getString("days") || "0";
            const silent = interaction.options.getBoolean("silent") || false;
            const errorEmbed = new discord_js_1.EmbedBuilder().setColor("Red");
            if (!target) {
                return interaction.reply({
                    embeds: [errorEmbed.setDescription("❌ User is not in the server")],
                    ephemeral: true,
                });
            }
            if (target.id === interaction.user.id) {
                return interaction.reply({
                    embeds: [errorEmbed.setDescription("❌ You can't ban yourself")],
                    ephemeral: true,
                });
            }
            if (target.roles.highest.position >=
                ((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.roles).highest.position) {
                return interaction.reply({
                    embeds: [
                        errorEmbed.setDescription("❌ you can't ban an user with higher roles"),
                    ],
                    ephemeral: true,
                });
            }
            if (!target.bannable) {
                return interaction.reply({
                    embeds: [errorEmbed.setDescription("❌ you can't ban this user")],
                    ephemeral: true,
                });
            }
            if (reason.length > 512) {
                return interaction.reply({
                    embeds: [
                        errorEmbed.setDescription("❌ the reason can't be longer than 512 caracters"),
                    ],
                    ephemeral: true,
                });
            }
            yield (target === null || target === void 0 ? void 0 : target.send({
                embeds: [
                    errorEmbed
                        .setDescription(`🔨 you were **banned** from \`${(_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.name}\` by ${interaction.member}, reason:[${reason}]`)
                        .setImage((_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.iconURL({})),
                ],
            }).catch());
            try {
                yield (target === null || target === void 0 ? void 0 : target.ban({ deleteMessageSeconds: (0, ms_1.default)(days), reason: reason }));
            }
            catch (_l) {
                return interaction.reply({ embeds: [errorEmbed.setDescription("❌ there was an error")] });
            }
            interaction.reply({
                embeds: [
                    errorEmbed.setDescription(`🔨 banned ${target} - \`${target.id}\``),
                ],
                ephemeral: true,
            });
            if (!silent) {
                interaction.channel;
                yield ((_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.send({
                    embeds: [
                        errorEmbed
                            .setAuthor({ name: `🔨 Ban | ${target.user.tag}` })
                            .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                            .setDescription(`**Reason:** \`${reason}\` ${days
                            ? "0"
                            : `this user messages in the previous \`${days}\` have been deleted`}`),
                    ],
                }).then((msg) => __awaiter(this, void 0, void 0, function* () { return yield msg.react("🔨"); })));
            }
            const guild = yield GuildConfig_1.default.findOne({ guildId: interaction.guildId });
            if (guild &&
                ((_f = (_e = guild.logs) === null || _e === void 0 ? void 0 : _e.moderation) === null || _f === void 0 ? void 0 : _f.enabled) &&
                ((_h = (_g = guild.logs) === null || _g === void 0 ? void 0 : _g.moderation) === null || _h === void 0 ? void 0 : _h.channelId)) {
                (_k = ((yield ((_j = interaction.guild) === null || _j === void 0 ? void 0 : _j.channels.fetch(guild.logs.moderation.channelId))))) === null || _k === void 0 ? void 0 : _k.send({
                    embeds: [
                        errorEmbed
                            .setAuthor({ name: `🔨 Ban` })
                            .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                            .setDescription(`**User:** ${target} - \`${target.id}\` **Reason:** \`${reason}\` ${days
                            ? "0"
                            : `this user messages in the previous \`${days}\` have been deleted`}`)
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
exports.default = BanAdd;
