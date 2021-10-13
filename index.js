const { Client, Intents } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });
const token = ''; // Discord bot token (secret)
const guilds = ['831073029823528961'] // Whitelisted Discord Servers to respond to

bot.on('ready', () => {
    console.log('bot logged in to Discord')
});

function hasDiscordRole(msg,roleName){
    // Check if role exists on user sending message
    return msg.member.roles.cache.some(role => role.name === roleName);
}

const prefix = '!';
bot.on('messageCreate', async msg => {
    let {guild} = msg; // Set guild var
    let {channel} = msg; // Set channel var

    console.log(`New message in channel ${channel.name} on server ${guild.name}`);

    if(msg.content[0] === prefix){
        if(guilds.includes(guild.id.toString()) !== true){
            console.log(guilds);
            console.log(guild ? `Guild not whitelisted: ${guild.name} (${guild.id})` : "New private message");
            return;
        }

        if(channel.name === 'bot-test'){
            if(msg.content === (prefix+'joke')){
                msg.reply('knock knock');
            }
        }


        if (msg.content === "!ping") {
            console.log("ping");
            console.log(msg);
            console.log(hasDiscordRole(msg,'The Isle'))
            msg.reply("pong");
          }
        // End prefix commands
    }
  });

bot.login(token);