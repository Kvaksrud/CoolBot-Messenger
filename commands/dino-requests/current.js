require('dotenv').config(); // Include environment variables
const lang = require('./../../lang/default.js'); // Config
const backend = require('./../../library/backend.js'); // API / Database
const messaging = require('./../../library/messaging.js');
const ftp_commands = require('./../../library/ftp.js');
const { debug } = require('./../../library/debug.js');

const { MessageEmbed } = require('discord.js');

async function handle(args,message){
    let reply;
    await message.reply('Please wait...').then((sentReply) => { reply = sentReply; });

    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);reply.delete();return;});
    if(registrationStatus === null) return; // Exit if error

    if(registrationStatus.success !== true){
        console.log(registrationStatus);
        reply.edit('You are not registered');
        return;
    }

    ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
        debug(result);
        reply.delete();
        messaging.CurrentDino(message,result.CharacterClass,result.Growth,(result.bGender === true ? 'Female' : 'Male'))
        //reply.edit('```Class: '+result.CharacterClass+'\nGrowth: '+result.Growth+'\nGender: '+ (result.bGender === true ? 'Female' : 'Male') +'```');
    }).catch((err) => {
        if(err.code === 550){
            reply.delete(); messaging.ErrorMessage(message,'No active dinosaur','We cannot find any records of a dinosaur on your Steam ID on our server.\rMake sure you safe-log when exiting the server.')
        } else {
            reply.delete(); messaging.Error(message,err);
        }
    });
    return;
}

module.exports = {
    handle
};