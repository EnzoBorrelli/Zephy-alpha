import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import ms from "ms";
const { version, dependencies } = require(`${process.cwd()}/package.json`);

export default class BotInfo extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "botinfo",
      description: "Get detailed information of the bot",
      category: Category.Utilities,
      default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
      options: [],
      dev: false,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setThumbnail(this.client.user?.displayAvatarURL()!)
          .setColor("Green")
          .setDescription(
            `__**Zephy Info**___ \n 
            >**Bot:** \`${this.client.user?.tag}\` \n >**Created:** <t:${(
              this.client.user!.createdTimestamp / 1000
            ).toFixed(0)}:R> \n >**Commands:** \`${
              this.client.commands.size
            }\` \n >**DJS version:** \`${version}\` \n >**NodeJS Version:** \`${
              process.version
            }\` \n >**Dependencies (${
              Object.keys(dependencies).length
            }):** \`${Object.keys(dependencies).map((p) =>
              `${p}-V${dependencies[p]}`.replace(/\^/g, "")
            )}\` \n > **Uptime:** \`${ms(this.client.uptime!, {
              long: false,
            })}\` \n\n __**guild Info**___ 
            \n >**Total Guilds:** \`${
              (await this.client.guilds.fetch()).size
            }\` 
            \n\n __**Dev Team**___ 
            \n >**Creator:** \`Endy®\` 
            \n >**Developers:** \`Endy®\` 
            \n >**Testers:** \`Endy®\`,\`Eimin\``
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Invite me")
            .setStyle(ButtonStyle.Link)
            .setURL(
              "https://discord.com/oauth2/authorize?client_id=1290767235337687206&permissions=8&integration_type=0&scope=applications.commands+bot"
            ),
          new ButtonBuilder()
            .setLabel("Support server")
            .setStyle(ButtonStyle.Link)
            .setURL(
              "https://discord.gg/2ATQkaypqQ"
            ),
          new ButtonBuilder()
            .setLabel("Website? | (in the future)")
            .setStyle(ButtonStyle.Link)
            .setURL(
              "https://discord.com/oauth2/authorize?client_id=1290767235337687206&permissions=8&integration_type=0&scope=applications.commands+bot"
            ),
        ),
      ],
    });
  }
}
