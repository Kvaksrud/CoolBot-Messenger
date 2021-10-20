require('dotenv').config(); // Include environment variables
const config = require('./../config.js'); // Config
const backend = require('./../library/backend.js'); // API / Database

async function handle(args,message){
    const SteamID = args[0];
    const regexp_steam_id = new RegExp(config.REGEX.STEAM_ID);
    console.log(SteamID,config.REGEX.STEAM_ID,regexp_steam_id.test(SteamID))

    if(regexp_steam_id.test(SteamID) !== true){
        message.reply('Steam ID is invalid or missing from command. ```Usage: !register <my numeric Steam ID>```');
        return;
    }

    // Check if registered
    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err) =>{
        message.reply(replyUnableToConnectToBackend);
        return null;
    });
    console.log('registrationStatus: ',registrationStatus);

    if(!registrationStatus) // Is this right?
        return;

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

module.exports = {
    handle
};