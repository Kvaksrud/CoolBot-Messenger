// Give money from one player to another (bank balance to bank balance)
require('dotenv').config(); // Include environment variables
const lang = require('../lang/default.js'); // Config
const backend = require('../library/backend.js'); // API / Database
const laborLang = require('../lang/en/labor.js');
const { debug } = require('../library/debug.js');
const messaging = require('../library/messaging.js');

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

    debug(laborStatus);

    if(laborStatus.code === 263){
        const moment = require('moment');
        const lastMoment = moment().add(laborStatus.data.seconds_left,'s');
        reply.edit('You can work again <t:'+lastMoment.unix()+':R>.');
        return;
    } else if(laborStatus.code === 0){
        messaging.Labor(message,laborStatus);
        reply.delete();
        //reply.edit(laborStatus.data.item.description + '\rThe amount was added to your '+laborStatus.data.item.target+'.')
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