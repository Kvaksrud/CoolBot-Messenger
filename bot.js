/**
 * Coolbot Messenger
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */

const { debug } = require('./library/debug.js');
const fs = require('fs')
const messaging = require('./library/messaging.js');

// Discord
const { Client, Intents, MessageAttachment, MessageEmbed, SystemChannelFlags } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// Log ready state
bot.on('ready', () => {
    console.log('Bot logged in to Discord')
    bot.channels.cache.get(process.env.DISCORD_CHANNEL_ID_BOT_TALK).send('Hello! I\'m online again.')
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

        // Dynamic command loading
        let definition;
        if(
            channel.id === process.env.DISCORD_CHANNEL_ID_DINO
            || channel.id === process.env.DISCORD_CHANNEL_ID_REGISTER
            || channel.id === process.env.DISCORD_CHANNEL_ID_BANKING
            || channel.id === process.env.DISCORD_CHANNEL_ID_LABOR
            || channel.id === process.env.DISCORD_CHANNEL_ID_CONTRIBUTORS
        ){
            let path;
            if(command === 'bal' || command === 'balance') path = `./commands/${channel.name.toLowerCase()}/money.js` // Alias
            else if(command === 'd' || command === 'dep') path = `./commands/${channel.name.toLowerCase()}/deposit.js` // Alias
            else if(command === 'w' || command === 'with') path = `./commands/${channel.name.toLowerCase()}/withdraw.js` // Alias
            else if(command === 'work') path = `./commands/${channel.name.toLowerCase()}/labor.js` // Alias
            else if(command === 'transfer' || command === 'give') path = `./commands/${channel.name.toLowerCase()}/send.js` // Alias
            else
                path = `./commands/${channel.name.toLowerCase()}/${command}.js` // Dynamic path

            try {
                if (fs.existsSync(path)) {
                    let cmdDefinition = require(path);
                    await cmdDefinition.handle(args,message);
                } else {
                    messaging.ErrorMessage(message,'Invalid Command','The command you specified does not exist.\rCheck pinned messages for command usage.');
                }
            } catch(err) {
                debug(['Failure in command require and handle',err]);
                messaging.Error(message,err);
            }
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
            (channel.id === process.env.DISCORD_CHANNEL_ID_REGISTER
            || channel.id === process.env.DISCORD_CHANNEL_ID_BANKING
            || channel.id === process.env.DISCORD_CHANNEL_ID_DINO
            || channel.id === process.env.DISCORD_CHANNEL_ID_LABOR
            || channel.id === process.env.DISCORD_CHANNEL_ID_CONTRIBUTORS)
            && message.author.bot === false
        ){
            message.author.send('Chatting in a bot controlled channel is disallowed.\rPlease use regular chat channels to communicate with other users.');
            message.delete();
        }
    }
});

// Login and start working
bot.login(process.env.DISCORD_BOT_TOKEN);