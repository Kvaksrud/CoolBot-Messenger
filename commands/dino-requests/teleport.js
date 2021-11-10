/**
 * Coolbot Messenger - Teleport
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
    .setDescription('Execution time for teleports may take up to ``1 minute``.')
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
     * Check possible teleports for the member
     */
    roles = message.member.roles.cache.map((role) => role.toString());
    console.log(roles);
    const possibleTeleports = await backend.possibleTeleports(roles).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!possibleTeleports) return; // Exit execution if missing
    debug([possibleTeleports.data,args[0]]);
    
    /**
     * Check if requested location is valid
     */
    if((args[0] in possibleTeleports.data) === false){ // Invalid selection
        reply.delete();
        if(args[0] === 'help')
            messaging.InfoMessage(message,'Teleport Help','To teleport a dinosaur use command as example: ```SYNTAX: !teleport <destination_code>\r\rEXAMPLE:\r!teleport northtwin```\rA complete location- and price list has been sent to you as a private message.');
        else {
            messaging.ErrorMessage(message,'Invalid Command Usage','Either you do not have permission to teleport to the requested destination,\ror the location requested is invalid.\r\rPlease use ``!teleport help`` for usage instructions and a complete list of locations available to you.');
            return;
        }
        
        let fields = "```Code - Name (Cost)";
        for (const [key, value] of Object.entries(possibleTeleports.data)) {
            fields = fields + "\r" + key + " - " + value
          }
          fields = fields + "```"

        const availableRequestsEmbed = new MessageEmbed() // TODO: Move to messaging
        .setColor('#0099ff')
        .setTitle('Dinosaur teleport locations')
        .setDescription('Use in the dinosaur request channel like this example ``!teleport titan``')
        .addFields({
            "name": "Valid selections",
            "value": fields
        })
        .setTimestamp()
      
        message.author.send({ embeds: [availableRequestsEmbed] });
        return;
    }

    /**
     * Connect to FTP and get player JSON
     */
    const currentPlayer = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!currentPlayer) return;
    debug(['currentPlayer = ',currentPlayer]);

    /**
     * Request teleport modification from Backend
     */
    const requestTeleport = await backend.requestTeleport(
        message.guild.id,
        message.member.id,
        roles,
        args[0],
        currentPlayer
    ).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!requestTeleport) return;
    console.log(requestTeleport);

    if(requestTeleport.code === 263){
        /**
         * Code 263 - User on cooldown
         */
        const moment = require('moment');
        const lastMoment = moment().add(requestTeleport.data.seconds_left,'s');
        reply.delete();
        messaging.WarningMessage(message,'You are on a cooldown','You can teleport again <t:'+lastMoment.unix()+':R>');
        return;
    } else if(requestTeleport.code === 300){
        /**
         * Code 300 - Insufficient funds
         */
        reply.delete();
        messaging.InsufficientFunds(message);
        return;
    } 

    /**
     * Connect to FTP and save injected player JSON
     */
    const injection = await ftp_commands.injectPlayerData(registrationStatus.data.item.steam_id,requestTeleport.data.item.sheet).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!injection) return;

    if(injection === true){
        /**
         * player JSON was successfully uploaded to FTP
         */
        reply.delete();
        messaging.SuccessMessage(message,'Successfully teleported dinosaur','Your dinosaur has been successfully teleported!\rYou can now log in to the server in your new location.');
        await backend.updateRequestInjection(requestTeleport.data.item.id,'success').catch((err)=>{messaging.Error(message,err);return;});
    } else {
                /**
         * player JSON failed to upload to FTP
         */
        await backend.updateRequestInjection(requestInjection.data.item.id,'failed').catch((err)=>{messaging.Error(message,err);return;});
    }
    return;
}

module.exports = {
    handle
};