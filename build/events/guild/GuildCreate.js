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
const db_1 = __importDefault(require("../../lib/db")); // Make sure supabase is set up correctly
class GuildCreate extends Event_1.default {
    constructor(client) {
        super(client, {
            name: discord_js_1.Events.GuildCreate,
            description: "Guild Join",
            once: false,
        });
    }
    Execute(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the guild already exists in the database
                const { data: existingGuild, error } = yield db_1.default
                    .from("guildconfig") // Your table name
                    .select("*")
                    .eq("guildid", guild.id)
                    .single(); // Fetch a single record by guildId
                // If the guild doesn't exist, insert it
                if (!existingGuild) {
                    const { data, error: insertError } = yield db_1.default
                        .from("guildconfig") // Table name
                        .insert([{ guildid: guild.id }]); // Correct insert object
                    if (insertError) {
                        console.error("Error inserting new guild config:", insertError);
                    }
                    else {
                        console.log("New guild config inserted:", data);
                    }
                }
            }
            catch (error) {
                console.error("Error checking or inserting guild config:", error);
            }
            // Send a welcome message to the owner
            const owner = yield guild.fetchOwner();
            owner === null || owner === void 0 ? void 0 : owner.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor("Green")
                        .setDescription("Thanks for inviting me!"),
                ],
            }).catch((err) => {
                console.error("Error sending welcome message:", err);
            });
        });
    }
}
exports.default = GuildCreate;
