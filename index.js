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
require('dotenv').config(); // Include environment variables
const config = require('./config.js'); // Config
const path = require('path');

/*
 * Requirements
 */
// Discord
const { Client, Intents, MessageAttachment } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// FTP Client
const ftp = require('ftp');

// File System
const fs = require('fs');

// json_merger
const json_merger = require('json_merger');

// Steam ID tester
const regexp_steam_id = new RegExp(config.STEAM.ID_REGEX);

// Log ready state
bot.on('ready', () => {
    console.log('bot logged in to Discord')
});

// Commands
const ftp_commands = require('./library/ftp.js')
const templates = require('./library/dinoTemplates.js');

/*
 * Functions
 */

function hasDiscordRole(message,roleName){
    // Check if role exists on user sending message
    return message.member.roles.cache.some(role => role.name === roleName);
}

function getCurrentDino(SteamID){
    const dinoFTPPath = config.FTP.PLAYER_PROFILE_PATH + SteamID + '.json'
    const dinoCachePath = config.FTP.PLAYER_PROFILE_CACHE_PATH + SteamID + '.json';

    console.log(dinoFTPPath);
    console.log(dinoCachePath);

    const ftp = require('ftp');
    const c = new ftp();
    c.on('ready', function() {
        c.get(dinoFTPPath, function(err, stream) {
          if (err) return false; // False if file does not exist
          stream.once('close', function() {
              c.end(); // Close FTP

              let content = fs.readFileSync(dinoCachePath);
              //fs.unlinkSync(dinoCachePath); // Delete file from cache
              return JSON.parse(content);
          });
          stream.pipe(fs.createWriteStream(dinoCachePath));
        });
      });
      c.connect({
          host: process.env.FTP_HOST,
          user: process.env.FTP_USER,
          port: process.env.FTP_PORT,
          password: process.env.FTP_PASSWORD,
          secure: config.FTP.SECURE,
          secureOptions: { rejectUnauthorized: config.FTP.ONLY_TRUSTED_CERTIFICATES }
      });
}

function getFTPFile(ftpFilePath,localFilePath,JSONOutput = false){
    console.log('createfolder',createFoldersRecursive(localFilePath));
    console.log('deleteIfExist',deleteFileIfExists(localFilePath));

    const c = new ftp();
    c.on('ready', function() {
        console.log('ftp ready');
        c.get(ftpFilePath, function(err, stream) {
            console.log('ftp get');
            if (err){
                console.log(err);
                return; // Null if file does not exist
            }
            stream.once('close', function() {
                c.end(); // Close FTP
                console.log('output',JSONOutput)
                if(JSONOutput === true){
                    const jsonContent = readJSONFile(localFilePath);
                    console.log('jsonContent',jsonContent);
                    deleteFileIfExists(localFilePath);
                    return jsonContent;
                }
            });
            stream.pipe(fs.createWriteStream(localFilePath));
        });
    });
    c.connect({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        port: process.env.FTP_PORT,
        password: process.env.FTP_PASSWORD,
        secure: config.FTP.SECURE,
        secureOptions: { rejectUnauthorized: config.FTP.ONLY_TRUSTED_CERTIFICATES }
      });
}

function readJSONFile(filePath){
    if(fs.existsSync(filePath) === false){
        return; // File does not exist
    }

    const fileContent = fs.readFileSync(filePath); // Open file
    return JSON.parse(fileContent); // Convert string to JSON
}

function writeJSONFile(filePath,object){
    try {
        deleteFileIfExists(filePath);
        fs.writeFileSync(filePath, JSON.stringify(object));
    } catch(err){
        console.log('Failed to write JSON to file');
        console.error(err);
        return;
    }

    return true;
}

function createFoldersRecursive(filePath){
    const dir = path.dirname(filePath);
    console.log(filePath,dir);

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}

function deleteFileIfExists(filePath){
    if(fs.existsSync(filePath) === true){
        fs.unlinkSync(filePath); // Delete file
    }
    return;
}

function isRegistered(userId){
    return fs.existsSync(config.DISCORD.MEMBER_PATH + userId.toString() + '.json');
}

function getRegisteredUser(userId){
    const userData = readJSONFile(config.DISCORD.MEMBER_PATH + userId.toString() + '.json');
    if(userData === null){
        return null;
    }
    return userData;
}

function replyNotRegistered(message){
    message.reply('You have not registered your Steam ID');
    return;
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
        if(config.DISCORD.GUILD !== guild.id.toString()){
            console.log(config.DISCORD_GUILD);
            console.log(guild ? `Guild not whitelisted: ${guild.name} (${guild.id})` : "New private message");
            return;
        }

        console.log(`New message in channel ${channel.name} on server ${guild.name} from ${member.user.username}`);
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        console.log(command,args);

        const member_data = getRegisteredUser(member.id);
        //console.log('Member',member,member_data);

        if(channel.name === 'bot-test'){
            if(command === 'knockknock'){
                const attachment = new MessageAttachment('https://static.posters.cz/image/1300/plakater/breaking-bad-i-am-the-one-who-knocks-i15742.jpg');
                message.reply({files: [attachment]})
                    .then(() => console.log(`Replied to message "${message.content}"`))
                    .catch(console.error);
            }
        }

        // !dino
        if(command === 'dino'){
            if(isRegistered(member.id) === false){
                replyNotRegistered(message);
                return;
            }
            if(args.length === 0){ // !dino (no args)
                ftp_commands.currentPlayerData(member_data.steam_id).then((result) => {
                    message.reply('```Class: '+result.CharacterClass+'\nGrowth: '+result.Growth+'\nGender: '+ (result.bGender === true ? 'Female' : 'Male') +'```');
                }).catch((err) => {
                    console.error(err);
                });
                return;
            } else if(args[0] === 'inject'){ // !dino inject <dino> <gender>
                if(templates.InjectionNames.includes(args[1]) !== true){
                    message.reply('Invalid dino selection.\n```Valid selection: ' + templates.InjectionNames.sort().join(', ') + '\nExample: !dino inject trike f```');
                    return;
                }
                if(args[2] !== 'f' && args[2] !== 'm'){
                    message.reply('You must select a gender.\n```Valid selection: m, f\nExample: !dino inject trike f```');
                    return;
                }

                const currentPlayer = await ftp_commands.currentPlayerData(member_data.steam_id).then((result) => {
                    return result;
                }).catch((err) => {
                    console.error(err);
                    message.reply('I\'m having issues trying to figure out your current player configuration. Please try again later.');
                    return;
                });
                
                //console.log('currentPlayer = ',currentPlayer);
                const templateDino = templates.generate(args[1],args[2],currentPlayer);
                //console.log('templateDino = ',templateDino);
                const injection = await ftp_commands.injectPlayerData(member_data.steam_id,templateDino).then((result) => {
                    return result;
                }).catch((err) => {
                    console.error(err);
                    message.reply('I\'m having issues trying to inject your dinosaur. Please try again later.');
                    return;
                })

                if(injection === true){
                    message.reply('Your dino has been successfully injected!');
                    return;
                }
                
            } else { // Invalid command
                message.reply('Invalid command');
            }
            return;
        }

        if (command === 'register') { // TODO: Move to library and minimize code
            const SteamID = args[0];
            
            console.log(SteamID,config.STEAM.ID_REGEX,regexp_steam_id.test(SteamID))

            if(regexp_steam_id.test(SteamID) !== true){
                message.reply('Steam ID is invalid');
                return;
            }

            // Check if registered
            try {
                if (isRegistered(member.id.toString())) {
                    const userData = getRegisteredUser(member.id.toString())
                    message.reply(`You are already registered.\n\nYour account was registered at: ${userData.registered_date}\nSteam ID: ${userData.steam_id}\n\nPlease create a ticket to remove the Steam ID from your account.`);
                    return;
                }
            } catch(err) {
                console.log('User profile is not registered');
                console.error(err);
            }

            // Register
            console.log(message.member);
            let memberData = {
                registered_date: new Date().toISOString(),
                steam_id: SteamID,
                known_as: [
                    member.user.username
                ]
            };

            // Write to storage
            try {
                fs.writeFileSync(config.DISCORD.MEMBER_PATH + member.id.toString() + '.json', JSON.stringify(memberData));
            } catch(err){
                console.log('Failed writing register data to disk');
                console.error(err);
                message.reply('Failed saving registration data. Please try again at a later time.');
                return;
            }

            message.reply('Your Steam ID was successfully registered!');
        }

        /* dev commands */
        if(hasDiscordRole(message,'Developer')){
            if (command === "me") {
                console.log(message);
                console.log(message.member);
                message.reply(JSON.stringify(message.member));
            }

            if (command === "ping") {
                console.log("ping");
                console.log(message);
                console.log(hasDiscordRole(message,'The Isle'))
                message.reply("pong");
                return;
            }
        }
        // End prefix commands
    }
});

// Login and start working
bot.login(process.env.DISCORD_BOT_TOKEN);