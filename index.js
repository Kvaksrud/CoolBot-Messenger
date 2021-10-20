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
const { Client, Intents, MessageAttachment, SystemChannelFlags } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// FTP Client
const ftp = require('ftp');

// File System
const fs = require('fs');

// json_merger
const json_merger = require('json_merger');

// Regex
const regexp_steam_id = new RegExp(config.REGEX.STEAM_ID);
const regexp_gender = new RegExp(config.REGEX.GENDER);

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

const replyUnableToConnectToBackend = 'I\'m sorry for the inconvenience but it seems I currently cannot connect to the mother ship.\nPlease try again later.';

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
                    if(err.code === 550)
                        reply.edit('You do not have an active dino on our server.\nLog in to the server and safe-log to save your progress.').catch((errD) => {
                            console.log('Discord Error:')
                            console.error(errD);
                        });
                    else if(err.code === 'ECONNREFUSED'){
                        console.error(err);
                        reply.edit(replyUnableToConnectToBackend).catch((errD) => {
                            console.log('Discord Error:')
                            console.error(errD);
                        });
                    } else {
                        console.log('Unknown error from FTP command');
                        console.error(err);
                        reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-DINO``').catch((errD) => {
                            console.log('Discord Error:')
                            console.error(errD);
                        });
                    };
                    
                });
                return;
            } else if(args[0] === 'inject'){ // !dino inject <dino> <gender>
                if(templates.InjectionNames.includes(args[1]) !== true){
                    message.reply('Invalid dino selection.\n```Valid selection: ' + templates.InjectionNames.sort().join(', ') + '\nExample: !dino inject trike f```');
                    return;
                }
                if(regexp_gender.test(args[2]) !== true){
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
            console.log(SteamID,config.REGEX.STEAM_ID,regexp_steam_id.test(SteamID))

            if(regexp_steam_id.test(SteamID) !== true){
                message.reply('Steam ID is invalid or missing from command. ```Usage: !register <my numeric Steam ID>```');
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
                console.log(registrationStatus.data.item.steam_id);
                message.reply(`You are already registered.\n\nYour account was registered at: ${registrationStatus.data.item.created_at}\nSteam ID: ${registrationStatus.data.item.steam_id}\n\nPlease create a ticket to remove the Steam ID from your account.`);
                return;
            }

            // Register
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