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
const ftp_commands = require('./library/ftp.js');
const templates = require('./library/dinoTemplates.js');
const backend = require('./library/backend.js');

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

const replyUnableToConnectToBackend = 'I\'m sorry for the inconvenience but it seems I currently cannot connect to the mother ship. Please try again later.';

/*
 * Commands
 */
const prefix = '!';
bot.on('messageCreate', async message => {
    const {guild} = message; // Set guild var
    const {channel} = message; // Set channel var
    const {member} = message; // Set member var

    if(message.content[0] === prefix){
        if(config.DISCORD.GUILDS.includes(guild.id.toString()) === false){
            console.log(guild ? `Guild is not whitelisted: ${guild.name} (${guild.id})` : "New private message");
            return;
        }

        console.log(`New message in channel ${channel.name} on server ${guild.name} from ${member.user.username}`);
        const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        console.log(command,args);

        //const member_data = getRegisteredUser(member.id);
        //console.log('Member',member,member_data);

        // !dino
        if(command === 'dino'){
            let registrationStatus = await backend.getRegistration(guild.id,member.id).catch((err) =>{
                message.reply(replyUnableToConnectToBackend);
                return null;
            });

            console.log(registrationStatus);
            if(registrationStatus.success !== true){
                console.log(registrationStatus);
                message.reply('You are not registered');
                return;
            }
            if(args.length === 0){ // !dino (no args)
                let reply;
                await message.reply('Please wait while I check the server...').then((sentReply) => { reply = sentReply; });
                //console.log('Reply: ',reply);
                console.log(registrationStatus.data.item.steam_id);
                ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
                    console.log(result);
                    reply.edit('```Class: '+result.CharacterClass+'\nGrowth: '+result.Growth+'\nGender: '+ (result.bGender === true ? 'Female' : 'Male') +'```');
                }).catch((err) => {
                    reply.edit('i failed u').catch((errD) => {
                        console.log('Discord Error:')
                        console.error(errD);
                    });
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

                let reply;
                await message.reply('Please wait while I do some magic! Cast time is a little long, hold on :)').then((sentReply) => { reply = sentReply; });
                const currentPlayer = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
                    return result;
                }).catch((err) => {
                    console.error(err);
                    reply.edit('I\'m having issues trying to figure out your current player configuration. Please try again later.');
                    return;
                });
                
                console.log('currentPlayer = ',currentPlayer);
                const templatedDino = templates.generate(args[1],args[2],currentPlayer);
                console.log('templateDino = ',templatedDino);

                const injection = await ftp_commands.injectPlayerData(registrationStatus.data.item.steam_id,templatedDino).then((result) => {
                    return result;
                }).catch((err) => {
                    console.error(err);
                    reply.edit('I\'m having issues trying to inject your dinosaur. Please try again later.');
                    return;
                })

                if(injection === true){
                    reply.edit('Your dino has been successfully injected! You can now log in to the server.');
                    await backend.storeCharacterSheet(guild.id,member.id,templatedDino,'injection').catch((err) => {
                        console.log('Failed to log injection')
                        console.error(err);
                    })
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
            let registrationStatus = await backend.getRegistration(guild.id,member.id).catch((err) =>{
                message.reply(replyUnableToConnectToBackend);
                return null;
            });
            if(!registrationStatus)
                return;

            console.log(registrationStatus);
            if(registrationStatus.success === true){
                message.reply(`You are already registered.\n\nYour account was registered at: ${registrationStatus.data.item.created_at}\nSteam ID: ${registrationStatus.data.item.steam_id}\n\nPlease create a ticket to remove the Steam ID from your account.`);
                return;
            }

            // Register
            //console.log(message.member);
            let registration = await backend.register(guild.id,member.id,SteamID,member.user.username);
            console.log(registration);
            if(registration.success === true){
                message.reply('Your Steam ID was successfully registered!');
            } else {
                message.reply('I was unable to register you. Please try again later.');
            }
            return;
        }

        /* dev commands */
        if(hasDiscordRole(message,'Developer') || hasDiscordRole(message,'Bot Developer')){
            if (command === "me") {
                console.log(message);
                console.log(message.member);
                message.reply(JSON.stringify(message.member));
            }

            if(command === "myreg"){
                let reg = await backend.getRegistration(guild.id,member.id);
                console.log(reg);
                if(reg.success === true){
                    message.reply('You are registered');
                } else {
                    message.reply('You are not registered');
                }
            }

            if (command === "ping") {
                console.log("ping");
                console.log(message);
                //console.log(hasDiscordRole(message,'The Isle'))
                message.reply("pong");
                return;
            }

            if(command === 'knockknock'){
                const attachment = new MessageAttachment('https://static.posters.cz/image/1300/plakater/breaking-bad-i-am-the-one-who-knocks-i15742.jpg');
                message.reply({files: [attachment]})
                    .then(() => console.log(`Replied to message "${message.content}"`))
                    .catch(console.error);
            }
            
            if (command === 'test') {
                //let pd = await ftp_commands.currentPlayerData(76561197992028830);
                //console.log(pd);
                /*let characterSheet = await backend.storeCharacterSheet();
                console.log(characterSheet);
                console.log(characterSheet.data.item.content);*/
                /*console.log(characterSheet.content);
                console.log(characterSheet.member);*/
                return;
            }
        }
        // End prefix commands
    }
});

// Login and start working
bot.login(process.env.DISCORD_BOT_TOKEN);