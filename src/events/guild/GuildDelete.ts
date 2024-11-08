import { Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import supabase from "../../lib/db";

export default class GuildDelete extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildDelete,
      description: "Guild Leave",
      once: false,
    });
  }

  async Execute(guild: Guild) {
    try {
      // Deleting the guild record from the database based on the guildId
      const { data, error: deleteError } = await supabase
        .from("guildconfig") // Your table name
        .delete()
        .eq("guildid", guild.id); // Matching the guildId

      if (deleteError) {
        console.error("Error deleting guild config:", deleteError);
      } else {
        console.log("Guild config deleted:", data);
      }
    } catch (error) {
      console.error("Error during guild delete:", error);
    }
  }
}
