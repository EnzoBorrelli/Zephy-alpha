import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import supabase from "../../lib/db"; // Make sure supabase is set up correctly

export default class GuildCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildCreate,
      description: "Guild Join",
      once: false,
    });
  }

  async Execute(guild: Guild) {
    try {
      // Check if the guild already exists in the database
      const { data: existingGuild, error } = await supabase
        .from("guildconfig") // Your table name
        .select("*")
        .eq("guildid", guild.id)
        .single(); // Fetch a single record by guildId

      // If the guild doesn't exist, insert it
      if (!existingGuild) {
        const { data, error: insertError } = await supabase
          .from("guildconfig") // Table name
          .insert([{ guildid: guild.id }]); // Correct insert object

        if (insertError) {
          console.error("Error inserting new guild config:", insertError);
        } else {
          console.log("New guild config inserted:", data);
        }
      }
    } catch (error) {
      console.error("Error checking or inserting guild config:", error);
    }

    // Send a welcome message to the owner
    const owner = await guild.fetchOwner();
    owner
      ?.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription("Thanks for inviting me!"),
        ],
      })
      .catch((err) => {
        console.error("Error sending welcome message:", err);
      });
  }
}
