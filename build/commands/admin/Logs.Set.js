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
const db_1 = __importDefault(require("../../lib/db")); // Ensure you have configured the Supabase client
class LogsSet extends SubCommand_1.default {
    constructor(client) {
        super(client, {
            name: "logs.set",
        });
    }
    Execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = interaction.options.getChannel("channel");
            yield interaction.deferReply({ ephemeral: true });
            try {
                // Check if guild config exists
                let { data: guild, error: fetchError } = yield db_1.default
                    .from("guildconfig")
                    .select("*")
                    .eq("guildid", interaction.guildId)
                    .single();
                if (fetchError) {
                    console.error("Error fetching guild config:", fetchError);
                    return interaction.editReply({
                        embeds: [this.createErrorEmbed("❌ Error fetching guild config.")],
                    });
                }
                // If guild config doesn't exist, create it
                if (!guild) {
                    const { data: newGuild, error: insertError } = yield db_1.default
                        .from("guildconfig")
                        .insert({ guildid: interaction.guildId })
                        .select()
                        .single();
                    if (insertError) {
                        console.error("Error creating guild config:", insertError);
                        return interaction.editReply({
                            embeds: [this.createErrorEmbed("❌ Error creating guild config.")],
                        });
                    }
                    guild = newGuild;
                }
                // Check if logs entry exists for this guild config
                let { data: logs, error: logError } = yield db_1.default
                    .from("logs")
                    .select("*")
                    .eq("guildconfigid", guild.id)
                    .single();
                // If logs entry doesn't exist, create it
                if (logError || !logs) {
                    const { data: newLogs, error: insertError } = yield db_1.default
                        .from("logs")
                        .insert({ guildconfigid: guild.id, enabled: true })
                        .select()
                        .single();
                    if (insertError) {
                        console.error("Error creating logs entry:", insertError);
                        return interaction.editReply({
                            embeds: [this.createErrorEmbed("❌ Error creating logs entry.")],
                        });
                    }
                    logs = newLogs;
                }
                // Update the channel ID for moderation logs
                const { error: updateError } = yield db_1.default
                    .from("logs")
                    .update({ channelid: channel.id })
                    .eq("id", logs.id);
                if (updateError) {
                    console.error("Error updating channel ID:", updateError);
                    return interaction.editReply({
                        embeds: [this.createErrorEmbed("❌ Error updating channel ID.")],
                    });
                }
                return interaction.editReply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor("Green")
                            .setDescription(`✔ Moderation logs channel set to ${channel}`),
                    ],
                });
            }
            catch (error) {
                console.error("Unexpected error:", error);
                return interaction.editReply({
                    embeds: [this.createErrorEmbed("❌ An unexpected error occurred.")],
                });
            }
        });
    }
    // Helper function for error embed creation
    createErrorEmbed(description) {
        return new discord_js_1.EmbedBuilder().setColor("Red").setDescription(description);
    }
}
exports.default = LogsSet;
