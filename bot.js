/*
 *
 *  BOT written by Patrick Kvaksrud (patrick@kvaksrud.no)
 *  https://github.com/Kvaksrud/CoolBot
 *  DOB: 2021-10-13
 *  Description: This bot was created to support the TCGC community with a fresh and uniqueue bot for supporting Discord and The Isle
 *  Licence: MIT
 * 
 */

require('dotenv').config(); // Include environment variables
const { debug } = require('./library/debug.js');

// Discord
const { Client, Intents, MessageAttachment, MessageEmbed, SystemChannelFlags } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// Log ready state
bot.on('ready', () => {
    console.log('Bot logged in to Discord')
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

        const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        debug([`New message in channel ${channel.name} on server ${guild.name} from ${member.user.username}`,command,args]);

        // DINO CHANNEL
        if(channel.id === process.env.DISCORD_DINO_CHANNEL_ID){
            if(command === 'current'){
                let definition = require('./commands/dino-requests/current.js') // TODO: Minimize even MORE!
                await definition.handle(args,message);
                return;
            }
            else if(command === 'inject'){
                let definition = require('./commands/dino-requests/inject.js') // TODO: Minimize even MORE!
                await definition.handle(args,message);
                return;
            }
            else if(command === 'teleport'){
                let definition = require('./commands/dino-requests/teleport.js') // TODO: Minimize even MORE!
                await definition.handle(args,message);
                return;
            } else {
                message.reply('Invalid command');
                return;
            }
        }

        // REGISTER
        if(channel.id === process.env.DISCORD_REGISTER_CHANNEL_ID){
            if (command === 'register') { // TODO: Minimize even MORE!
                let definition = require('./commands/register.js')
                await definition.handle(args,message);
                return;
            }
    
            message.reply('Invalid command');
            return;
        }


        // BANK ACCOUNT
        if(channel.id === process.env.DISCORD_BANKING_CHANNEL_ID){
            if (command === 'money' || command === 'bal' || command === 'balance') { // TODO: Minimize even MORE!
                let definition = require('./commands/money.js')
                await definition.handle(args,message);
                return;
            }
            if (command === 'deposit' || command === 'dep') { // TODO: Minimize even MORE!
                let definition = require('./commands/deposit.js')
                await definition.handle(args,message);
                return;
            }
            if (command === 'withdraw' || command === 'with') { // TODO: Minimize even MORE!
                let definition = require('./commands/withdraw.js')
                await definition.handle(args,message);
                return;
            }
            if (command === 'send') { // TODO: Minimize even MORE!
                let definition = require('./commands/send.js')
                await definition.handle(args,message);
                return;
            }

            message.reply('Invalid command');
            return;
        }
        

        /**
         * Labor
         */
         if(channel.id === process.env.DISCORD_LABOR_CHANNEL_ID){
            if (command === 'labor') { // TODO: Minimize even MORE!
                let definition = require('./commands/labor.js')
                await definition.handle(args,message);
                return;
            }

            message.reply('Invalid command');
            return;
         }


        /* dev commands */
        if(hasDiscordRole(message,'Developer') || hasDiscordRole(message,'Bot Developer')){
            if (command === "me") {
                console.log(message);
                console.log(message.member);
                //message.reply(JSON.stringify(message.member.roles));
                roles = message.member.roles.cache.map((role) => role.toString());
                console.log("json:",JSON.stringify(roles));
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
    } else {
        if(
            (channel.id === process.env.DISCORD_REGISTER_CHANNEL_ID
            || channel.id === process.env.DISCORD_BANKING_CHANNEL_ID
            || channel.id === process.env.DISCORD_DINO_CHANNEL_ID
            || channel.id === process.env.DISCORD_LABOR_CHANNEL_ID
            || channel.id === process.env.DISCORD_REGISTRATION_ROLE_ID)
            && message.author.id !== process.env.DISCORD_BOT_MEMBER_ID
        ){
            message.author.send('Chatting in a bot controlled channel is disallowed.\rPlease use regular chat channels to communicate with other users.');
            message.delete();
        }
    }
});

// Login and start working
bot.login(process.env.DISCORD_BOT_TOKEN);