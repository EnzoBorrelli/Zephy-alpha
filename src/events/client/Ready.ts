import { Collection, Events, REST, Routes, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import ReactionRole from "../../base/schemas/ReactionRole";

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: "Ready Event",
      once: true,
    });
  }
  async Execute() {
    console.log(`${this.client.user?.tag} is now ready`);

    const clientId = this.client.developmentMode
      ? this.client.config.devDiscordClientId
      : this.client.config.discordClientId;
    const rest = new REST().setToken(this.client.config.token);

    if (!this.client.developmentMode) {
      const globalCommands: any = await rest.put(
        Routes.applicationCommands(clientId),
        {
          body: this.GetJson(
            this.client.commands.filter((command) => !command.dev)
          ),
        }
      );
      console.log(
        `succesfully set ${globalCommands.length} global app (/) commands.`
      );
    }
    const devCommands: any = await rest.put(
      Routes.applicationGuildCommands(clientId, this.client.config.devGuildId),
      {
        body: this.GetJson(
          this.client.commands.filter((command) => command.dev)
        ),
      }
    );
    console.log(`succesfully set ${devCommands.length} dev app (/) commands.`);
    await this.loadReactionRoles();
  }

  private GetJson(commands: Collection<string, Command>) {
    const data: object[] = [];
    commands.forEach((command) => {
      data.push({
        name: command.name,
        description: command.description,
        options: command.options,
        default_member_permissions:
          command.default_member_permissions.toString(),
        dm_permission: command.dm_permission,
      });
    });
    return data;
  }
  private async loadReactionRoles() {
    console.log("im being summoned");
    try {
      const reactionRoles = await ReactionRole.find();

      for (const reactionRole of reactionRoles) {
        const guild = this.client.guilds.cache.get(reactionRole.guildId);
        if (!guild) {
          console.log("guild not found");
          continue;
        }
        const channel = guild.channels.cache.get(
          reactionRole.channelId
        ) as TextChannel;
        if (!channel) {
          console.log("channel not found");
          continue;
        }
        try {
          const message = await channel.messages.fetch(reactionRole.messageId);
          if (message) {
            console.log(
              `Loaded reaction role for message ${reactionRole.messageId} in guild ${guild.id}`
            );
          }
        } catch (error) {
          console.error(
            `Error loading message ${reactionRole.messageId}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Failed to load reaction roles on startup:", error);
    }
  }
}
