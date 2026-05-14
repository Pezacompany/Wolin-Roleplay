import {
  ApplicationCommandOptionType,
  SlashCommandBuilder
} from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("weryfikuj")
    .setDescription("Połącz konto Roblox z kontem Discord.")
    .setDMPermission(false),
  new SlashCommandBuilder()
    .setName("kto-to")
    .setDescription("Sprawdź powiązanie Discord <-> Roblox.")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("roblox")
        .setDescription("Nick Roblox gracza.")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("Użytkownik Discord.")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("mapuj-role")
    .setDescription("Zarządzaj mapowaniem ról Discord na team/rangę Roblox.")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("dodaj")
        .setDescription("Dodaj lub zaktualizuj mapowanie roli.")
        .addRoleOption((option) =>
          option.setName("rola").setDescription("Rola Discord.").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("team").setDescription("Team/ranga w Roblox.").setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("priorytet")
            .setDescription("Wyższy priorytet wygrywa, gdy gracz ma wiele ról.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("usun")
        .setDescription("Wyłącz mapowanie roli.")
        .addRoleOption((option) =>
          option.setName("rola").setDescription("Rola Discord.").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("lista").setDescription("Pokaż aktywne mapowania ról.")
    )
].map((command) => command.toJSON());

export const ktoToOptionTypes = {
  ROBLOX: ApplicationCommandOptionType.String,
  DISCORD: ApplicationCommandOptionType.User
};
