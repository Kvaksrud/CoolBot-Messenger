/**
 * Coolbot Messenger
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 * 
 * All generic Discord replies and functioned recide
 * inside this module.
 */
const { MessageEmbed } = require('discord.js');

function BankingBalance(message,balance,wallet,comment=null,title='Banking statement'){
    let description;
    if(comment !== null){
        description = 'Account. no ' + message.member.id.toString()
                    + '\r\r' + comment.toString();
    } else {
        description = 'Account. no ' + message.member.id.toString()
    }

    const msgEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle(title)
        .setDescription(description)
        .addFields(
            { name: 'Wallet', value: (':moneybag: ' + wallet.toString()), inline: true },
            { name: 'Bank balance', value: (':moneybag: ' + balance.toString()), inline: true },
            { name: 'Total', value: (':moneybag: ' + (balance + wallet).toString()) },
        )
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });
}
function NoBankAccount(message){
    InfoMessage(
        message,
        'You do not have a bank account!',
        `You have not earned or received any money, thus not having a bank account.\rCheck out the ${message.guild.channels.cache.get(process.env.DISCORD_CHANNEL_ID_LABOR).toString()} channel to start working.\rAs soon as you make som money a bank account will be opened for you.`);
};
function TransactionInvalidAmount(message){
    const invalidAmountReply = 'The amount supplied in the command is not valid.\rThe valid format is numbers between ``1`` and ``1000000`` or ``all``.'
    ErrorMessage(message,'Invalid amount supplied',invalidAmountReply)
}
function Labor(message,doLaborReply){
    const description = doLaborReply.data.item.description.split('|');
    const msgEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle('Labor')
        .setDescription(description[0] + ' :moneybag: ' + doLaborReply.data.item.amount.toString() + ' ' + description[1] + '\rThe amount was added to your ' + doLaborReply.data.item.target)
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });
}
function CurrentDino(message,name,growth,gender){
    const msgEmbed = new MessageEmbed()
        .setColor(1345368)
        .setTitle('Current Dinosaur on server')
        .setDescription('This data is extracted from the saved data on the server.')
        .addFields(
            { name: 'Type', value: name, inline: true },
            { name: 'Growth', value: growth, inline: true },
            { name: 'Gender', value: gender, inline: true }
        )
        .setTimestamp()
    message.reply({ embeds: [msgEmbed] });
}
function InfoMessage(message,title,description){
    const msgEmbeded = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });
}
function SuccessMessage(message,title,description,private=false){
    const msgEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    if(private === true)
        message.author.send({ embeds: [msgEmbeded] });
    else
        message.reply({ embeds: [msgEmbeded] });
}
function ErrorMessage(message,title,description){
    const msgEmbeded = new MessageEmbed()
        .setColor(13632027)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });
}
function ErrorUnknown(message){
    messaging.ErrorMessage(message,'An unknown error occured','Please contact support by creating a ticket.')
}
function WarningMessage(message,title,description){
    const msgEmbeded = new MessageEmbed()
        .setColor(16312092)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });
}
function Error(message,error,pingBotTalkChannel=true){
    console.error(error); // Output to console

    let description;
    if(error.code === 'ECONNREFUSED')
        description = 'Look\'s like there is an issue with the interwebs on my end. Please create a ticket.';
    else if(error.code === 550) // 550 = FTP File Does Not Exist
        description = 'It does not look like you haven`t safely logged out of the server.\rYour player profile cannot be found.';
    else
        description = 'An unknown error occured';

    const msgEmbeded = new MessageEmbed()
        .setColor(13632027)
        .setTitle('Error')
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [msgEmbeded] });

    if(pingBotTalkChannel === true){
        const msgBotTalkEmbeded = new MessageEmbed()
        .setColor(13632027)
        .setTitle('An error occured')
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription(`A user tried executing the command \`\`${message.content}\`\`, but it failed with an error.`)
        .addField('Error Code',`\`\`${error.code}\`\``,true)
        .addField('Channel of origin',`\`\`#${message.channel.name}\`\``,true)
        .addField('Error Message',`\`\`${error.message}\`\``)
        .setTimestamp()
        message.guild.channels.cache.get(process.env.DISCORD_CHANNEL_ID_BOT_TALK).send({ embeds: [msgBotTalkEmbeded] })
    }
}
/**
 * Send a message of insufficient funds
 * @param {*} message Discord Message
 * @param {string} additionalComment An additional comment on the end of the message.
 */
function InsufficientFunds(message,additionalComment=null){
    if(additionalComment !== null)
        ErrorMessage(message,'Insufficient Funds','You do not have enough money :moneybag: to complete your transaction.\r\r' + additionalComment)
    else
        ErrorMessage(message,'Insufficient Funds','You do not have enough money :moneybag: to complete your transaction.')
}

module.exports = {
    BankingBalance,
    NoBankAccount,
    TransactionInvalidAmount,
    Labor,
    CurrentDino,
    Error,
    ErrorMessage,
    ErrorUnknown,
    InfoMessage,
    SuccessMessage,
    WarningMessage,
    InsufficientFunds,
}