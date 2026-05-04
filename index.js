// index.js - FIXED + /clear BEFEHL NUR FÜR 989585848
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder
} = require('discord.js');

class BerlinRPBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Channel, Partials.Message, Partials.User],
    });

    this.applications = new Collection();
    this.cooldowns = new Collection();
    this.stats = { applications: 47, accepted: 12, denied: 35 };
    
    this.PANEL_CHANNEL = "1440773946457849986";
    this.LOG_CHANNEL = "1500940474196824115";
    this.WELCOME_CHANNEL = "1440684525351997580";
    this.ADMIN_USER_ID = "1375570669949157396"; // ✅ NUR DIESER USER
    
    this.questions = [
      "Wie heißt du & wie alt bist du?",
      "Was ist RDM?",
      "Was ist VDM?",
      "Was ist FailRP?",
      "Was ist Powergaming?",
      "Warum willst du ins Team?",
      "Hast du Erfahrung?",
      "Wie gehst du mit Stress um?",
      "RP Beispiel",
      "Regelverständnis erklären",
      "Sonstiges"
    ];

    this.init();
  }

  async init() {
    this.registerEvents();
    this.registerSlashCommands();
    this.startCleanupInterval();
    
    await this.client.login("");
  }

  // ✅ NEU: SLASH COMMANDS REGISTRIEREN
  async registerSlashCommands() {
    const clearCommand = new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Löscht Nachrichten (Admin only)')
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Anzahl Nachrichten zum löschen (1-100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)
      );

    try {
      await this.client.application.commands.create(clearCommand);
      console.log('✅ /clear Slash Command registriert!');
    } catch (error) {
      console.log('Slash Command bereits registriert:', error.message);
    }
  }

  registerEvents() {
    this.client.once('clientReady', () => this.onReady());
    this.client.on('interactionCreate', (i) => this.handleInteraction(i));
    this.client.on('guildMemberAdd', member => this.onMemberJoin(member));
  }

  // 🔥 GEILES WILKOMMEN SYSTEM (FIXED)
  async onMemberJoin(member) {
    try {
      const welcomeChannel = await this.client.channels.fetch(this.WELCOME_CHANNEL);
      if (!welcomeChannel?.isTextBased()) return;

      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎉 Willkommen auf DresdenRP! 🎉')
        .setDescription(`
**Hallo ${member.user}!** 👋

**✨ Du bist Mitglied #${member.guild.memberCount.toLocaleString()}!**

**🚀 Schnellstart Guide:**
- 📋 **Regeln lesen** → <#1440685745076441228>
- 💬 **Chat starten** → <#1440686444615045301>
- ❓ **Hilfe nötig?** → <#1440768323582296164>

**🎖️ Verifiziere dich für volle Rechte:**
1️⃣ Reagiere mit ✅

**Wir freuen uns auf dich!** ❤️
        `)
        .setColor(0x00FF88)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Username', value: `${member.user.tag}`, inline: true },
          { name: '🆔 User ID', value: member.user.id, inline: true },
          { name: '📅 Beigetreten', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true }
        )
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXJ3b3R3b3h3b3h3b3h3b3h3b3h3b3h3b3h3b3h3b/giphy.gif')
        .setFooter({ text: 'DresdenRP • Das beste RP Server', iconURL: this.client.user.displayAvatarURL() })
        .setTimestamp();

      const verifyRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel('✅ VERIFIZIEREN')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🔓'),
          new ButtonBuilder()
            .setURL('https://discord.gg/bgRmDZ4z')
            .setLabel('🔗 Discord Invite')
            .setStyle(ButtonStyle.Link)
        );

      await welcomeChannel.send({
        content: `<@${member.user.id}>`,
        embeds: [welcomeEmbed],
        components: [verifyRow]
      });

      console.log(`✅ Welcome für ${member.user.tag} gesendet!`);
    } catch (error) {
      console.error('Welcome Error:', error);
    }
  }

  startCleanupInterval() {
    setInterval(() => this.cleanupOldData(), 5 * 60 * 1000);
    console.log('🧹 Auto-Cleanup gestartet (alle 5min)');
  }

  cleanupOldData() {
    const now = Date.now();
    
    for (const [userId, cooldown] of this.cooldowns) {
      if (cooldown < now - 24 * 60 * 60 * 1000) {
        this.cooldowns.delete(userId);
      }
    }
    
    for (const [userId, app] of this.applications) {
      if (app.timestamp < now - 7 * 24 * 60 * 60 * 1000) {
        this.applications.delete(userId);
      }
    }
  }

  async onReady() {
    console.log(`✅ ${this.client.user.tag} - Bewerbungs + Welcome + /clear System ⚡`);
    await this.updatePanel();
  }

  // ✅ FIXED: SAFER INTERACTION HANDLER (Slash Commands + Buttons + Modals)
  async handleInteraction(interaction) {
    try {
      // ✅ /clear BEFEHL - NUR FÜR 989585848
      if (interaction.isChatInputCommand() && interaction.commandName === 'clear') {
        await this.handleClearCommand(interaction);
        return;
      }

      if (!interaction.isButton() && !interaction.isModalSubmit()) return;
      
      if (interaction.replied || interaction.deferred) return;

      const replyOptions = { ephemeral: true };

      if (interaction.isButton()) {
        await this.handleButton(interaction, replyOptions);
      } else if (interaction.isModalSubmit()) {
        await this.handleModal(interaction, replyOptions);
      }
    } catch (error) {
      console.error('Interaction Error:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten!', ephemeral: true });
        }
      } catch {}
    }
  }

  
  async handleClearCommand(interaction) {
    const adminId = this.ADMIN_USER_ID;
    
    // ✅ NUR 989585848 darf /clear nutzen
    if (interaction.user.id !== adminId) {
      return interaction.reply({
        content: '❌ **Du hast keine Berechtigung für diesen Befehl!** 🔒',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('amount');
    
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ **Anzahl muss zwischen 1-100 liegen!**',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      await interaction.channel.bulkDelete(messages, true);
      
      const reply = await interaction.editReply({
        content: `✅ **${amount} Nachrichten gelöscht!** 🧹`
      });

      // ✅ Auto-Delete Reply nach 3 Sekunden
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 3000);

      console.log(`🧹 ${interaction.user.tag} hat ${amount} Nachrichten gelöscht`);
    } catch (error) {
      await interaction.editReply({
        content: '❌ **Fehler beim Löschen!** (Bot braucht "Nachrichten verwalten" Rechte)'
      });
    }
  }

  async updatePanel() {
    try {
      const channel = await this.client.channels.fetch(this.PANEL_CHANNEL);
      if (!channel?.isTextBased()) return;

      const pendingCount = this.applications.filter(a => a.status === 'pending').size;
      const acceptRate = this.stats.applications > 0 
        ? Math.round((this.stats.accepted / this.stats.applications) * 100)
        : 0;

      const embed = new EmbedBuilder()
        .setTitle('🎯 DresdenRP Bewerbungscenter v2.0')
        .setDescription(`
**🤖 Willkommen beim modernen Bewerbungssystem!**

**📊 Live Statistiken:**
- 📋 **0** Bewerbungen
- ✅ **0** Angenommen  
- ❌ **0** Abgelehnt
- 📊 **100%** Akzeptanzrate
- ⏳ **${pendingCount}** Offen

👉 **Klicke unten um zu starten!**
        `)
        .setColor(0x00FF88)
        .setThumbnail(this.client.user.displayAvatarURL())
        .setFooter({ text: 'DresdenRP • Codet by Flawa' })
        .setTimestamp();

      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('start_application')
            .setLabel('🚀 Bewerbung starten')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📝')
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('panel_refresh')
            .setLabel('🔄 Refresh')
            .setStyle(ButtonStyle.Primary)
        );

      const messages = await channel.messages.fetch({ limit: 10 });
      const existing = messages.find(msg => 
        msg.embeds[0]?.title?.includes('DresdenRP Bewerbungscenter')
      );

      if (existing) {
        await existing.edit({ embeds: [embed], components: [row1, row2] });
      } else {
        await channel.send({ embeds: [embed], components: [row1, row2] });
      }
    } catch (error) {
      console.error('Panel Update Error:', error);
    }
  }

  // ✅ FIXED: Welcome Buttons
  async handleVerifyButton(interaction) {
    try {
      if (interaction.customId === 'verify_user') {
        if (interaction.replied || interaction.deferred) return;
        await interaction.reply({
          content: `✅ **${interaction.user} wurde verifiziert!** 🎉\nDu hast jetzt volle Rechte!`,
          ephemeral: true
        });

        try {
          const verifiedRole = interaction.guild.roles.cache.get('1499753633812578312');
          if (verifiedRole) {
            await interaction.member.roles.add(verifiedRole);
          }

          const unverifiedRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('unverified'));
          if (unverifiedRole) {
            await interaction.member.roles.remove(unverifiedRole);
          }
        } catch (roleError) {
          console.log('Role Error (ignoriert):', roleError.message);
        }
      }
    } catch (error) {
      console.error('Verify Button Error:', error);
    }
  }

  async handleButton(interaction, replyOptions) {
    const customId = interaction.customId;

    if (customId === 'verify_user') {
      await this.handleVerifyButton(interaction);
      return;
    }

    if (customId === 'start_application') {
      await this.startApplication(interaction);
    } else if (customId === 'stats') {
      await this.showStats(interaction);
    } else if (customId === 'panel_refresh') {
      await this.updatePanel();
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '✅ Panel aktualisiert!', ephemeral: true });
      }
    } else if (customId.startsWith('accept_')) {
      await this.acceptApplication(interaction);
    } else if (customId.startsWith('deny_')) {
      await this.showDenyModal(interaction);
    }
  }

  // Rest der Methoden bleiben gleich...
  async startApplication(interaction) {
    const userId = interaction.user.id;

    const cooldown = this.cooldowns.get(userId);
    if (cooldown && cooldown > Date.now()) {
      const remaining = Math.ceil((cooldown - Date.now()) / (1000 * 60));
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `⏳ **Cooldown aktiv!** Warte noch **${remaining} Minuten**`,
          ephemeral: true
        });
      }
      return;
    }

    this.cooldowns.set(userId, Date.now() + 24 * 60 * 60 * 1000);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '📩 **DMs geöffnet!** Starte deine Bewerbung...',
        ephemeral: true
      });
    }

    try {
      const dmChannel = await interaction.user.createDM();
      const answers = [];

      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎯 DresdenRP Bewerbungssystem')
        .setDescription('**Beantworte die 11 Fragen nacheinander!**')
        .addFields(
          { name: '⏰ Zeitlimit', value: '10 Minuten pro Frage', inline: true },
          { name: '📝 Format', value: 'Schreibe direkt deine Antwort', inline: true }
        )
        .setColor(0x5865F2);

      await dmChannel.send({ embeds: [welcomeEmbed] });

      for (let i = 0; i < this.questions.length; i++) {
        const progress = Math.round(((i + 1) / this.questions.length) * 100);
        
        const questionEmbed = new EmbedBuilder()
          .setTitle(`❓ Frage ${i + 1}/${this.questions.length} [${progress}%]`)
          .setDescription(`**${this.questions[i]}**`)
          .setColor(0x2b2d31)
          .setFooter({ text: `Antwort in 10 Minuten | ${progress}% abgeschlossen` });

        await dmChannel.send({ embeds: [questionEmbed] });

        const collected = await dmChannel.awaitMessages({
          filter: m => m.author.id === userId,
          max: 1,
          time: 10 * 60 * 1000
        }).catch(() => null);

        answers.push(collected?.first()?.content || '❌ **Keine Antwort gegeben**');
      }

      const application = {
        userId,
        answers,
        timestamp: Date.now(),
        status: 'pending'
      };

      this.applications.set(userId, application);
      this.stats.applications++;

      await this.sendToLogChannel(application);
      
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Bewerbung erfolgreich!')
        .setDescription('**Deine Bewerbung wurde gespeichert und wird geprüft!**\n⭐ Du hörst bald von uns!')
        .setColor(0x00FF88);

      await dmChannel.send({ embeds: [successEmbed] });
      await this.updatePanel();

    } catch (error) {
      console.error('DM Error:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.followUp({
          content: '❌ **DMs deaktiviert!**\n👉 **Servereinstellungen > Datenschutz > DMs aktivieren**',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  async sendToLogChannel(application) {
    try {
      const logChannel = await this.client.channels.fetch(this.LOG_CHANNEL);
      if (!logChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('📥 **NEUE BEWERBUNG**')
        .setDescription(`**Bewerber:** <@${application.userId}>`)
        .addFields(
          { name: '📅 Zeitpunkt', value: `<t:${Math.floor(application.timestamp / 1000)}:F>`, inline: true },
          { name: '📊 Status', value: '⏳ **In Prüfung**', inline: true }
        )
        .setColor(0xFFD700)
        .setThumbnail(this.client.user.displayAvatarURL())
        .setTimestamp();

      application.answers.forEach((answer, i) => {
        const cleanAnswer = answer.length > 1000 ? answer.slice(0, 1000) + '...' : answer;
        embed.addFields({
          name: `Q${i + 1}: ${this.questions[i]}`,
          value: cleanAnswer || '❌ Leer',
          inline: false
        });
      });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_${application.userId}`)
            .setLabel('✅ ANNEHMEN')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`deny_${application.userId}`)
            .setLabel('❌ ABLEHNEN')
            .setStyle(ButtonStyle.Danger)
        );

      await logChannel.send({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Log Channel Error:', error);
    }
  }

  async acceptApplication(interaction) {
    const userId = interaction.customId.split('_')[1];
    const application = this.applications.get(userId);

    if (!application) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Bewerbung nicht gefunden!', ephemeral: true });
      }
      return;
    }

    application.status = 'accepted';
    this.stats.accepted++;
    this.applications.delete(userId);

    try {
      const user = await this.client.users.fetch(userId);
      await user.send('🎉 **HERZLICHEN GLÜCKWUNSCH!** 🎉\n\n**Du wurdest ANGENOMMEN!** 🚀\n\n**Willkommen im BerlinRP Team!**');
    } catch {}

    if (interaction.deferred) {
      await interaction.editReply({ 
        content: `✅ **${interaction.user.tag} hat <@${userId}> ANGENOMMEN!** 🎉`, 
        embeds: [], 
        components: [] 
      });
    } else {
      await interaction.reply({ 
        content: `✅ **${interaction.user.tag} hat <@${userId}> ANGENOMMEN!** 🎉`, 
        ephemeral: true 
      });
    }
    
    await this.updatePanel();
  }

  async showDenyModal(interaction) {
    const userId = interaction.customId.split('_')[1];

    const modal = new ModalBuilder()
      .setCustomId(`deny_modal_${userId}`)
      .setTitle('❌ Ablehnungsgrund');

    const reasonInput = new TextInputBuilder()
      .setCustomId('deny_reason')
      .setLabel('Warum ablehnen?')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('z.B. "Zu wenig RP-Erfahrung"')
      .setRequired(true)
      .setMaxLength(1000);

    modal.addComponents(
      new ActionRowBuilder().addComponents(reasonInput)
    );

    await interaction.showModal(modal);
  }

  async handleModal(interaction) {
    if (!interaction.customId.startsWith('deny_modal_')) return;

    const userId = interaction.customId.split('_')[2];
    const reason = interaction.fields.getTextInputValue('deny_reason');

    const application = this.applications.get(userId);
    if (!application) {
      await interaction.reply({ content: '❌ Bewerbung nicht gefunden!', ephemeral: true });
      return;
    }

    application.status = 'denied';
    application.denyReason = reason;
    this.stats.denied++;
    this.applications.delete(userId);

    try {
      const user = await this.client.users.fetch(userId);
      await user.send(
        `❌ **Bewerbung ABGELEHNT**\n\n**Grund:**\n\`\`\`${reason}\`\`\`\n\n` +
        `💡 **Nächste Bewerbung:** <t:${Math.floor((Date.now() + 24*60*60*1000)/1000)}:R>`
      );
    } catch {}

    await interaction.reply({
      content: `❌ **${interaction.user.tag} hat <@${userId}> ABGELEHNT**\n**Grund:** ${reason}`,
      ephemeral: true
    });

    await this.updatePanel();
  }

  async showStats(interaction) {
    const pendingCount = this.applications.filter(a => a.status === 'pending').size;
    
    const embed = new EmbedBuilder()
      .setTitle('📈 Vollständige Statistiken')
      .addFields(
        { name: '📋 Gesamt Bewerbungen', value: this.stats.applications.toString(), inline: true },
        { name: '✅ Angenommen', value: this.stats.accepted.toString(), inline: true },
        { name: '❌ Abgelehnt', value: this.stats.denied.toString(), inline: true },
        { 
          name: '📊 Akzeptanzrate', 
          value: this.stats.applications > 0 
            ? `**${Math.round((this.stats.accepted / this.stats.applications) * 100)}%**`
            : '0%', 
          inline: true 
        },
        { name: '⏳ Offen in Prüfung', value: pendingCount.toString(), inline: true },
        { name: '🧹 Cooldowns aktiv', value: this.cooldowns.size.toString(), inline: true }
      )
      .setColor(0x5865F2)
      .setFooter({ text: `Bot Uptime: ${Math.floor(process.uptime())}s` })
      .setTimestamp();

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

// 🚀 PERFECT BOT MIT /clear FÜR 989585848!
console.log('🚀 Ich liebe füsse ...');
new BerlinRPBot();
