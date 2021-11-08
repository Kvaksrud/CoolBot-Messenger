// Show your money stats

require('dotenv').config(); // Include environment variables
const lang = require('../lang/default.js'); // Config
const backend = require('../library/backend.js'); // API / Database
const messaging = require('../library/messaging.js');
const { debug } = require('../library/debug.js');

async function handle(args,message){
    let reply;
    await message.reply('Please wait...').then((sentReply) => { reply = sentReply; });

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

        debug(registrationStatus);
    if(registrationStatus.success !== true){
        //if(registrationStatus.exception)
        reply.edit('You are not registered, so you are not elegible for a bank account. Please register before using our services. Thanks!');
        return;
    }
    if(args.length === 0){ // !money (no args)
        backend.getBankAccount(message.guild.id,message.member.id).then((result) => {
            debug(result);
            if(result.code === 0){
                reply.delete();
                messaging.BankingBalance(message,result.data.item.balance,result.data.item.wallet);
            } else if(result.code === 301){
                reply.edit('You do not currenlty have a bank account with us! Please do some grinding or have someone send you some money and we will open an account for you!');
            } else {
                reply.edit('I was able to talk to the bank manager, but we did not find your detals. Please have contact support ny creating a ticket.');
            }

        }).catch((err) => {
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
            
        });
        return;
    } else { // Invalid command
        reply.edit('Invalid command');
    }
    return;
}

module.exports = {
    handle
};