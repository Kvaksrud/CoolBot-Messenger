require('dotenv').config(); // Include environment variables
const lang = require('./../../lang/default.js'); // Config
const backend = require('./../../library/backend.js'); // API / Database
const messaging = require('./../../library/messaging.js');
const ftp_commands = require('./../../library/ftp.js');
const { debug } = require('./../../library/debug.js');

const { MessageEmbed } = require('discord.js');

const regexp_gender = new RegExp('^(f|female|m|male)$');

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

    roles = message.member.roles.cache.map((role) => role.toString());
    debug(roles);
    const possibleInjections = await backend.possibleInjections(roles).then((result) => {
        return result;
    }).catch((err) => {
        console.error(err);
        reply.edit('I\'m having issues trying to figure out your current player configuration. Please try again later.');
        return;
    });

    //console.log(possibleInjections.data,args[1],args[1] in possibleInjections.data)
    if((args[0] in possibleInjections.data) === false){ // Invalid selection
        reply.edit('Invalid command.\nYour valid selections and pricing has been sent to you as a private message.');
        let fields = "```Code - Name (Cost)";
        for (const [key, value] of Object.entries(possibleInjections.data)) {
            fields = fields + "\r" + key + " - " + value
            }
            fields = fields + "```"

        const availableRequestsEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Dinosaur injections')
        .setDescription('Use in the dinosaur request channel like this example ``!dino inject trike m``')
        .addFields({
            "name": "Valid selections",
            "value": fields
        })
        .setTimestamp()
        
        message.author.send({ embeds: [availableRequestsEmbed] });
        return;
    }

    if(regexp_gender.test(args[1]) !== true){
        reply.delete();
        messaging.ErrorMessage(message,'Invalid gender','You must select a gender.\n```Valid selection: m, f\nExample: !dino inject trike f```');
        return;
    }
    let gender;
    if(args[1] === "m") gender = "male";
    else if(args[1] === "f") gender = "female";
    else gender = args[1];

    await reply.edit('Please wait while I do some magic! Cast time varies on weather :)');
    const currentPlayer = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
        return result;
    }).catch((err) => {
        console.error(err);
        reply.edit('I\'m having issues trying to figure out your current player configuration. Are you sure you have safe logged? Please try again later.');
        return {
            'error': err
        };
    });
    if(currentPlayer.error){
        if(currentPlayer.error.code === 550)
            reply.edit('You must safe log to be able to inject.');
        return;
    }
    
    //console.log('currentPlayer = ',currentPlayer);

    const requestInjection = await backend.requestInjection(
        message.guild.id,
        message.member.id,
        roles,
        args[0],
        gender,
        currentPlayer
    ).then((result) => {
        return result;
    }).catch((err) => {
        console.error(err);
        reply.edit('I\'m having issues trying to figure out your current player configuration. Please try again later.');
        return;
    });
    console.log(requestInjection);

    if(requestInjection.code === 263){
        const moment = require('moment');
        const lastMoment = moment().add(requestInjection.data.seconds_left,'s');
        reply.delete();
        messaging.WarningMessage(message,'You are on a cooldown','You can inject again <t:'+lastMoment.unix()+':R>');
        return;
    } else if(requestInjection.code === 300){
        reply.edit('Insufficient funds');
        return;
    } 

    const injection = await ftp_commands.injectPlayerData(registrationStatus.data.item.steam_id,requestInjection.data.item.sheet).then((result) => {
        return result;
    }).catch((err) => {
        console.error(err);
        reply.edit('I\'m having issues trying to inject your dinosaur. Please try again later.');
        return;
    })

    if(injection === true){
        reply.delete();
        messaging.SuccessMessage(message,'Successfully injected dinosaur','Your dinosaur has been successfully injected!\rYou can now log in to the server.');
        await backend.updateRequestInjection(requestInjection.data.item.id,'success').catch((err) => {
            console.log('Failed to log injection')
            console.error(err);
        })
        return;
    } else {
        await backend.updateRequestInjection(requestInjection.data.item.id,'failed').catch((err) => {
            console.log('Failed to log injection')
            console.error(err);
        })
    }
    return;
}

module.exports = {
    handle
};