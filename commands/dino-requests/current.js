/**
 * Coolbot Messenger - current
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
const backend = require('./../../library/backend.js'); // API / Database
const messaging = require('./../../library/messaging.js');
const ftp_commands = require('./../../library/ftp.js');
const { debug } = require('./../../library/debug.js');
const { MessageEmbed } = require('discord.js');

async function handle(args,message){
    /**
     * Reply with normal message while working.
     * These commands with FTP can take time.
     */
     let reply;
     let replyEmbed = new MessageEmbed() // TODO: Move to messaging
     .setColor('#0099ff')
     .setTitle('Please wait')
     .setDescription('Execution time for checking current dinosaur may take up to ``1 minute``.')
     .setTimestamp()
     await message.reply({ embeds: [replyEmbed] }).then((sentReply) => { reply = sentReply; });

    /**
     * Require user to be registered
     * - Also fetches registration data like Steam ID
     */
     let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
     if(!registrationStatus) return;
     debug(registrationStatus);
     if(registrationStatus.success !== true){ reply.delete();messaging.ErrorMessage(message,'You are not registered','You have to register to be elegible for this service.'); return; }
 
    /**
     * Connect to FTP server and get current profile
     */
    const playerData = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!playerData) return;
    debug(playerData);
    reply.delete();
    messaging.CurrentDino(message,playerData.CharacterClass,playerData.Growth,(playerData.bGender === true ? 'Female' : 'Male'))
    return;
}

module.exports = {
    handle
};