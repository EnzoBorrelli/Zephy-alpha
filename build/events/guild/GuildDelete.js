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
const db_1 = __importDefault(require("../../lib/db"));
class GuildDelete extends Event_1.default {
    constructor(client) {
        super(client, {
            name: discord_js_1.Events.GuildDelete,
            description: "Guild Leave",
            once: false,
        });
    }
    Execute(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Deleting the guild record from the database based on the guildId
                const { data, error: deleteError } = yield db_1.default
                    .from("guildconfig") // Your table name
                    .delete()
                    .eq("guildid", guild.id); // Matching the guildId
                if (deleteError) {
                    console.error("Error deleting guild config:", deleteError);
                }
                else {
                    console.log("Guild config deleted:", data);
                }
            }
            catch (error) {
                console.error("Error during guild delete:", error);
            }
        });
    }
}
exports.default = GuildDelete;
