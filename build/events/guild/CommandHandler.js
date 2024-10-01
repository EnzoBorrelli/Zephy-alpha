"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Event_1 = __importDefault(require("../../base/classes/Event"));
class CommandHandler extends Event_1.default {
    constructor(client) {
        super(client, {
            name: discord_js_1.Events.InteractionCreate,
            description: "command handler event",
            once: false,
        });
    }
    Execute(interaction) {
        var _a;
        if (!interaction.isChatInputCommand())
            return;
        const command = this.client.commands.get(interaction.commandName);
        if (!command)
            return (
            //@ts-ignore
            interaction.reply({
                content: "this comand does not exist",
                ephemeral: true,
            }) && this.client.commands.delete(interaction.commandName));
        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new discord_js_1.Collection());
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        if ((timestamps === null || timestamps === void 0 ? void 0 : timestamps.has(interaction.user.id)) &&
            now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount)
            return interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`❌ Please wait another \`${(((timestamps.get(interaction.user.id) || 0) +
                        cooldownAmount -
                        now) /
                        1000).toFixed(1)}\ seconds to run this command`),
                ],
                ephemeral: true,
            });
        timestamps === null || timestamps === void 0 ? void 0 : timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps === null || timestamps === void 0 ? void 0 : timestamps.delete(interaction.user.id), cooldownAmount);
        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            const SubCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`;
            return (((_a = this.client.subCommands.get(SubCommand)) === null || _a === void 0 ? void 0 : _a.Execute(interaction)) ||
                command.Execute(interaction));
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.default = CommandHandler;
