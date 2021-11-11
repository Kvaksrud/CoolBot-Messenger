/**
 * Coolbot Messenger - Send
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
const backend = require('../../library/backend.js'); // API / Database
const messaging = require('../../library/messaging.js');
const { debug } = require('../../library/debug.js');
const { isNumeric } = require('./../../library/helpers.js');

async function handle(args,message){
    /**
     * Require user to be registered
     * - Also fetches registration data like Steam ID
     */
    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    if(!registrationStatus) return;
    debug(registrationStatus);
    if(registrationStatus.success !== true){ messaging.ErrorMessage(message,'You are not registered','You have to register to be elegible for this service.'); return; }

    /**
     * This command requires the user to mention another user
     */
    mentionedUser = message.mentions.users.first();
    debug(['MENTIONED_USER',mentionedUser]);
    if(typeof mentionedUser === 'undefined' && !mentionedUser){
        messaging.ErrorMessage(message,'Invalid user mention','This command requires a user to be mentioned in order to send money to that user.\rUsage: ``!send <at-player> <amount>``');
        return;
    }
    if(mentionedUser.bot === true){
        messaging.ErrorMessage(message,'Recipient is a bot','Bots cannot receive transactions from users.')
        return;
    }

    /**
     * Check if amount supplied is numeric
     */
    if(isNumeric(args[1]) === false){
        messaging.TransactionInvalidAmount(message);
        return;
    }

    /**
     * Check if amount supplied is within limits
     */
    const amount = Number(args[1]);
    if(0 >= amount || amount >= 1000000){
        messaging.TransactionInvalidAmount(message);
        return;
    }

    /**
     * Get the bank account statement of the sender
     */
    let senderBankAccount = await backend.getBankAccount(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    if(!senderBankAccount) return;

    if(senderBankAccount.code === 0){
        /**
         * Code 0 - Sender has bank account
         */
        if(amount > senderBankAccount.data.item.balance){
            /**
             * Insufficient funds in balance
             * - Transfers are done from balance -> balance
             */
            messaging.InsufficientFunds(message,'You can deposit money from your wallet to you balance by using ``!deposit <amount|all>``.')
            return;
        }
        
        /**
         * Do transfer
         */
        let transfer = await backend.doBankTransactionSend(message.guild.id,message.member.id,mentionedUser.id,amount).catch((err) => {messaging.Error(message,err);return;});
        if(!transfer) return;

        if(transfer.code === 0){
            /**
             * Code 0 - Transfer success
             */
            let comment = args[0] + ' received you transfer of :moneybag: ``' + args[1] + '``.\rYou new Banking Statement is included below';
            messaging.BankingBalance(message,transfer.data.bankAccount.balance,transfer.data.bankAccount.wallet,comment,'Money transfer to another player');
        } else if(transfer.code === 404){
            /**
             * Recipient is not registered with !register <steam_id>
             */
            messaging.ErrorMessage(message,'The recipient is not registered','The user you mentioned is not registered in the bot system.\rThis can be because the user is an administrator or moderator.');
        } else {
            /**
             * Unknown code from API - Should not happen
             */
            messaging.ErrorUnknown(message);
        }
    } else if(senderBankAccount.code === 301){ // Does not have bank account
        messaging.NoBankAccount(message);
    } else {
        messaging.ErrorUnknown(message);
    }
    return;
}

module.exports = {
    handle
};