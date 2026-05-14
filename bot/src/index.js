import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits
} from "discord.js";
import { config } from "./config.js";
import { getDb } from "./db.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once("ready", async () => {
  await getDb();
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "weryfikuj") {
      await handleVerify(interaction);
      return;
    }

    if (interaction.commandName === "kto-to") {
      await handleWhoIs(interaction);
      return;
    }

    if (interaction.commandName === "mapuj-role") {
      await handleRoleMapping(interaction);
    }
  } catch (error) {
    console.error("Interaction failed", {
      command: interaction.commandName,
      error: error?.message
    });

    const message = "Wystąpił błąd. Spróbuj ponownie albo zgłoś to administracji.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: message });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

async function handleVerify(interaction) {
  const url = new URL("/api/auth/roblox/start", config.PUBLIC_VERIFY_URL);
  url.searchParams.set("discordId", interaction.user.id);
  url.searchParams.set("guildId", interaction.guildId);

  await interaction.reply({
    content: `Kliknij prywatny link, aby połączyć konto Roblox: ${url.toString()}`,
    ephemeral: true
  });
}

async function handleWhoIs(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const roblox = interaction.options.getString("roblox");
  const discordUser = interaction.options.getUser("discord");

  if ((roblox && discordUser) || (!roblox && !discordUser)) {
    await interaction.editReply("Podaj dokładnie jedną opcję: `roblox` albo `discord`.");
    return;
  }

  const db = await getDb();
  const user = roblox
    ? await db.collection("users").findOne({
        robloxUsernameLower: roblox.trim().toLowerCase(),
        verified: true
      })
    : await db.collection("users").findOne({
        discordId: discordUser.id,
        verified: true
      });

  if (!user) {
    await interaction.editReply("Nie znaleziono zweryfikowanego powiązania.");
    return;
  }

  await interaction.editReply(
    `Discord: <@${user.discordId}>\nRoblox: **${user.robloxUsername}** (\`${user.robloxUserId}\`)`
  );
}

async function handleRoleMapping(interaction) {
  if (!hasAdminAccess(interaction)) {
    await interaction.reply({
      content: "Nie masz uprawnień do zarządzania mapowaniem ról.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const subcommand = interaction.options.getSubcommand();
  const db = await getDb();

  if (subcommand === "dodaj") {
    const role = interaction.options.getRole("rola", true);
    const team = interaction.options.getString("team", true).trim();
    const priority = interaction.options.getInteger("priorytet", true);

    await db.collection("roleMappings").updateOne(
      { guildId: interaction.guildId, discordRoleId: role.id },
      {
        $set: {
          guildId: interaction.guildId,
          discordRoleId: role.id,
          discordRoleName: role.name,
          robloxTeamName: team,
          priority,
          enabled: true,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    await interaction.editReply(
      `Zapisano mapowanie: ${role} -> **${team}** z priorytetem \`${priority}\`.`
    );
    return;
  }

  if (subcommand === "usun") {
    const role = interaction.options.getRole("rola", true);
    await db.collection("roleMappings").updateOne(
      { guildId: interaction.guildId, discordRoleId: role.id },
      { $set: { enabled: false, updatedAt: new Date() } }
    );

    await interaction.editReply(`Wyłączono mapowanie dla roli ${role}.`);
    return;
  }

  const mappings = await db
    .collection("roleMappings")
    .find({ guildId: interaction.guildId, enabled: true })
    .sort({ priority: -1, discordRoleName: 1 })
    .toArray();

  if (mappings.length === 0) {
    await interaction.editReply("Brak aktywnych mapowań.");
    return;
  }

  await interaction.editReply(
    mappings
      .map(
        (mapping) =>
          `<@&${mapping.discordRoleId}> -> **${mapping.robloxTeamName}** (priorytet \`${mapping.priority}\`)`
      )
      .join("\n")
  );
}

function hasAdminAccess(interaction) {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  if (!config.ADMIN_ROLE_ID) {
    return false;
  }

  return interaction.member?.roles?.cache?.has(config.ADMIN_ROLE_ID) ?? false;
}

process.on("SIGINT", () => client.destroy());
process.on("SIGTERM", () => client.destroy());

await client.login(config.DISCORD_TOKEN);

