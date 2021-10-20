/*
 *
 *  BOT written by Patrick Kvaksrud (patrick@kvaksrud.no)
 *  https://github.com/Kvaksrud/CoolBot
 *  DOB: 2021-10-13
 *  Description: This bot was created to support the TCGC community with a fresh and uniqueue bot for supporting Discord and The Isle
 *  Licence: MIT
 * 
 */

/*
 * Config
 */
const config = require('./config.js')
require('dotenv').config(); // Include environment variables

// Discord
const { Client, Intents, MessageAttachment, SystemChannelFlags } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// Log ready state
bot.on('ready', () => {
    console.log('bot logged in to Discord')
});

/*
 * Functions
 */
function hasDiscordRole(message,roleName){
    // Check if role exists on user sending message
    return message.member.roles.cache.some(role => role.name === roleName);
}

/*
 * Commands
 */
const prefix = '!';
bot.on('messageCreate', async message => {
    const {guild} = message; // Set guild var
    const {channel} = message; // Set channel var
    const {member} = message; // Set member var

    if(message.content[0] === prefix){
        if(guild.id !== process.env.DISCORD_GUILD){
            console.log(guild ? `Guild is not whitelisted: ${guild.name} (${guild.id})` : `New private message from ${member.user.username}`); // Does currently not support multi-guild's or direct messages
            return;
        }

        console.log(`New message in channel ${channel.name} on server ${guild.name} from ${member.user.username}`);
        const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        console.log(command,args);

        // DINO
        if(command === 'dino'){
            let definition = require('./commands/dino.js') // TODO: Minimize even MORE!
            await definition.handle(args,message);
            return;
        }

        // REGISTER
        if (command === 'register') { // TODO: Minimize even MORE!
            let definition = require('./commands/register.js')
            await definition.handle(args,message);
            return;
        }

        /* dev commands */
        if(hasDiscordRole(message,'Developer') || hasDiscordRole(message,'Bot Developer')){
            if (command === "me") {
                console.log(message);
                console.log(message.member);
                message.reply(JSON.stringify(message.member));
            }

            if (command === "ping") {
                console.log("ping");
                console.log(message);
                message.reply("pong");
                return;
            }

            if(command === 'knockknock'){
                const attachment = new MessageAttachment('https://static.posters.cz/image/1300/plakater/breaking-bad-i-am-the-one-who-knocks-i15742.jpg');
                message.reply({files: [attachment]})
                    .then(() => console.log(`Replied to message "${message.content}"`))
                    .catch(console.error);
            }
        }
        // End prefix commands
    }
});

// Login and start working
bot.login(process.env.DISCORD_BOT_TOKEN);