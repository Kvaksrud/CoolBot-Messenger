// Show your money stats

require('dotenv').config(); // Include environment variables
const lang = require('../lang/default.js'); // Config
const backend = require('../library/backend.js'); // API / Database
const messaging = require('../library/messaging.js');
const { debug } = require('../library/debug.js');

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

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
    if(args.length === 1){
        debug(['is numeric',isNumeric(args[0])])
        if(isNumeric(args[0]) === false){
            if(args[0].toLowerCase() === 'all'){
                let bankAccount = await backend.getBankAccount(message.guild.id,message.member.id).then((result) => {
                    return result;
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
                debug(bankAccount);
                if(bankAccount.code === 0){
                    args[0] = bankAccount.data.item.balance;
                } else if(bankAccount.code === 301){
                    reply.edit('You do not currenlty have a bank account with us! Please do some grinding or have someone send you some money and we will open an account for you!');
                    return;
                } else {
                    reply.edit('I was able to talk to the bank manager, but we did not find your detals. Please have contact support ny creating a ticket.');
                    return;
                }
            } else {
                reply.edit('The amount supplied is invalid.');
                return;
            }
        }
    
        debug('amount',args[0]);
        const amount = Number(args[0]);
        if(0 >= amount){
            reply.edit('The amount supplied is invalid.');
            return;
        } else if(amount >= 1000000){
            reply.edit('Your account has a withdrawal limit of ``1000000`` coins.');
            return;
        }

        let transfer = await backend.doBankTransfer(message.guild.id,message.member.id,'wallet',amount).then((result) => {
            debug(result);
            return result;
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
            return;
        });

        debug(transfer);
        if(transfer.code === 0) { // OK
            reply.delete();
            let comment = 'You withdrew :moneybag: ``' + amount.toString() + '`` from your Bank Balance.\rYour new Bank Statement is included below.';
            messaging.BankingBalance(message,transfer.data.bank_account.balance,transfer.data.bank_account.wallet,comment,'Bank Withdrawal Statement');
        } else if(transfer.code === 300) { // Insufficient funds
            reply.edit('Insufficient funds to complete transfer.\nYour balance is lower than what you are trying to withdraw.');
        } else {
            reply.edit('Unknown error. Please open a support ticket.');
        }
    } else { // Invalid command
        reply.edit('Invalid command');
    }
    return;
}

module.exports = {
    handle
};