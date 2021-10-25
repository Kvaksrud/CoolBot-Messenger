// Give money from one player to another (bank balance to bank balance)
require('dotenv').config(); // Include environment variables
const config = require('../config.js'); // Config
const lang = require('../lang/default.js'); // Config
const backend = require('../library/backend.js'); // API / Database
const laborLang = require('../lang/en/labor.js');
const { time } = require('@discordjs/builders');

function getRandomNumberBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

async function handle(args,message){
    let reply;
    await message.reply('Working...').then((sentReply) => { reply = sentReply; });

    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err) =>{
        if(err.code === 'ECONNREFUSED'){
            console.error(err);
            reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        } else {
            console.log('Unknown error');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        };
        return null;
    });
    if(registrationStatus === null) // Makes sure to exit execution if it could not connect to the api
        return;

    console.log(registrationStatus);
    if(registrationStatus.success !== true){
        console.log(registrationStatus);
        reply.edit('You are not registered, so you are not elegible for a bank account. Please register before using our services. Thanks!');
        return;
    }

    let lastLabor = await backend.doBankTransactionSearch(message.guild.id,message.member.id,'deposit',1,'labor').catch((err) => {
        if(err.code === 'ECONNREFUSED'){
            console.error(err);
            reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        } else {
            console.log('Unknown error');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        };
        return null;
    });
    
    const moment = require('moment');
    if(lastLabor.code === 0){
        if(lastLabor.data.items.length === 1){
            const lastLaborMoment = moment(lastLabor.data.items[0].created_at).add(config.LABOR.MINUTES_BETWEEN,'m');
            const duration = moment.duration(lastLaborMoment.diff(moment()));
            if(duration.asMilliseconds() > 0){ // Cooldown is on
                let timeString;
                if(duration.hours() > 0)
                    timeString = duration.hours().toString() + ' hour(s), ' + duration.minutes().toString() + ' minute(s) and ' + duration.seconds().toString() + ' second(s)';
                else if(duration.hours() === 0 && duration.minutes > 0)
                    timeString = duration.minutes().toString() + ' minute(s) and ' + duration.seconds().toString() + ' second(s)';
                else if(duration.hours() === 0 && duration.minutes() === 0 && duration.seconds() > 0){
                    timeString = duration.seconds().toString() + ' seconds';
                } else {
                    timeString = 'unknown';
                }
                reply.edit('You are still tired from your last labor session.\nYou can work again in ``'+timeString+'``');
                return;
            }
        }
    } else {
        reply.edit('Unknown error occured. Please contact support.');
        return;
    }
    return;

    const amount = getRandomNumberBetween(config.LABOR.MIN_AMOUNT,config.LABOR.MAX_AMOUNT);
    const currency = config.BANKING.CURRENCY;
    let laborCommand = laborLang.randomReply(amount,currency);
    console.log(amount,currency,laborCommand,message.member);

    let transfer = await backend.doBankTransaction(message.guild.id,message.member.id,'deposit',laborCommand.destination,amount,laborCommand.text,'labor').catch((err) => {
        if(err.code === 'ECONNREFUSED'){
            console.error(err);
            reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        } else {
            console.log('Unknown error from command');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        };
    })
    console.log(transfer);

    if(transfer.code === 0)
        reply.edit('<@!' + message.member.id.toString() + '>\n' + laborCommand.text + 'The money was added to your ' + laborCommand.destination + '.');
    else
        reply.edit('An unknown error occured. Please contact support.');


    return;
}

module.exports = {
    handle
};