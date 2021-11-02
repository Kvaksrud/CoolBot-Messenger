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
        reply.edit('You are not registered, so you are not elegible for labor. Please register before using our services. Thanks!');
        return;
    }

    let laborStatus = await backend.doLabor(message.guild.id,message.member.id).catch((err) =>{
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

    console.log(laborStatus);

    if(laborStatus.code === 263){
        const moment = require('moment');
        const lastLaborMoment = moment().add(laborStatus.data.seconds_left,'s');
        const duration = moment.duration(lastLaborMoment.diff(moment()));
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
        reply.edit(laborStatus.data.message + '\rYou can work again in ``'+timeString+'``.');
        return;
    } else if(laborStatus.code === 0){
        reply.edit(laborStatus.data.item.description + '\rThe amount was added to your '+laborStatus.data.item.target+'.')
        return;
    } else {
        reply.edit('Unknown reply from server. Please create a ticket.');
        return;
    }
    return;
}

module.exports = {
    handle
};