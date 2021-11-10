/**
 * Coolbot Messenger - inject
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

const regexp_gender = new RegExp('^(f|female|m|male)$');

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
     * Check possible injections for the member
     */
    roles = message.member.roles.cache.map((role) => role.toString());
    debug(['ROLES',roles]);
    const possibleInjections = await backend.possibleInjections(roles).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!possibleInjections) return;

    /**
     * Check if argument passed for injection is in the allowed list or if the user asked for help
     */
    if((args[0] in possibleInjections.data) === false){ // Invalid selection
        reply.delete();
        if(args[0] === 'help')
            messaging.InfoMessage(message,'Injection Help','To inject a dinosaur use command as example: ```SYNTAX: !inject <dino_code> <gender>\r\rEXAMPLE:\r!inject trike male\ror\r!inject trike female```\rA complete price list and dinosaurs available to you has been sent to you as a private message.');
        else {
            messaging.ErrorMessage(message,'Invalid Command Usage','Either you do not have permission to inject the requested dinosaur,\ror the dinosaur requested is invalid.\r\rPlease use ``!inject help`` for usage instructions and a complete list of dinosaurs available to you.');
            return;
        }
        let fields = "```Code - Name (Cost)";
        for (const [key, value] of Object.entries(possibleInjections.data)) {
            fields = fields + "\r" + key + " - " + value
            }
            fields = fields + "```"

        const msgEmbed = new MessageEmbed() // TODO: Move to messaging
        .setColor('#0099ff')
        .setTitle('Dinosaur injections')
        .setDescription('Use in the dinosaur request channel like this example ``!inject trike male``')
        .addFields({
            "name": "Valid selections",
            "value": fields
        })
        .setTimestamp()
        
        message.author.send({ embeds: [msgEmbed] });
        return;
    }

    /**
     * Test for valid gender argument
     */
    if(regexp_gender.test(args[1]) !== true){
        reply.delete();
        messaging.ErrorMessage(message,'Invalid gender','You must select a gender.\n```Valid selection: m|f|male|female\nExample: !inject trike female```');
        return;
    }
    let gender; // This section corrects m and f to male and female for use in backend (its an alias for users)
    if(args[1] === "m") gender = "male";
    else if(args[1] === "f") gender = "female";
    else gender = args[1];

    /**
     * Connect to FTP and get current player JSON
     */
    const currentPlayer = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!currentPlayer) return;
    debug(['CURRENT_PLAYER',currentPlayer]);

    /**
     * Request injection from backend.
     * Backend injects the JSON with the apropriate values.
     */
    const requestInjection = await backend.requestInjection(
        message.guild.id,
        message.member.id,
        roles,
        args[0],
        gender,
        currentPlayer
    ).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!requestInjection) return;
    debug(['INJECTION_REQUEST',requestInjection]);

    if(requestInjection.code === 263){
        /**
         * Code 263 - You are on cooldown
         */
        const moment = require('moment');
        const theMoment = moment().add(requestInjection.data.seconds_left,'s');
        reply.delete();
        messaging.WarningMessage(message,'You are on a cooldown','You can inject again <t:'+theMoment.unix()+':R>');
        return;
    } else if(requestInjection.code === 300){
        /**
         * Code 300 - Insufficient funds
         */
        reply.delete();
        messaging.InsufficientFunds(message);
        return;
    } 

    /**
     * Connect to FTP server and upload injected player JSON
     */
    const injection = await ftp_commands.injectPlayerData(registrationStatus.data.item.steam_id,requestInjection.data.item.sheet).catch((err)=>{reply.delete();messaging.Error(message,err);return;});
    if(!injection) return;
    debug(['INJECTION',injection]);

    if(injection === true){
        /**
         * player JSON was successfully uploaded to FTP
         */
        reply.delete();
        messaging.SuccessMessage(message,'Successfully injected dinosaur','Your dinosaur has been successfully injected!\rYou can now log in to the server.');
        await backend.updateRequestInjection(requestInjection.data.item.id,'success').catch((err)=>{messaging.Error(message,err);return;})
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