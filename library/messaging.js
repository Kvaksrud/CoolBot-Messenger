const { MessageEmbed } = require('discord.js');

function BankingBalance(message,balance,wallet,comment=null,title='Banking statement'){
    let description;
    if(comment !== null){
        description = 'Account. no ' + message.member.id.toString()
                    + '\r\r' + comment.toString();
    } else {
        description = 'Account. no ' + message.member.id.toString()
    }

    const bankingBalanceEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle(title)
        .setDescription(description)
        .addFields(
            { name: 'Wallet', value: (':moneybag: ' + wallet.toString()), inline: true },
            { name: 'Bank balance', value: (':moneybag: ' + balance.toString()), inline: true },
            { name: 'Total', value: (':moneybag: ' + (balance + wallet).toString()) },
        )
        .setTimestamp()
    message.reply({ embeds: [bankingBalanceEmbeded] });
}
function Labor(message,doLaborReply){
    const description = doLaborReply.data.item.description.split('|');
    const bankingBalanceEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle('Labor')
        .setDescription(description[0] + ' :moneybag: ' + doLaborReply.data.item.amount.toString() + ' ' + description[1] + '\rThe amount was added to your ' + doLaborReply.data.item.target)
        .setTimestamp()
    message.reply({ embeds: [bankingBalanceEmbeded] });
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
function SuccessMessage(message,title,description){
    const errorEmbeded = new MessageEmbed()
        .setColor(1345368)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [errorEmbeded] });
}
function ErrorMessage(message,title,description){
    const errorEmbeded = new MessageEmbed()
        .setColor(13632027)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [errorEmbeded] });
}
function WarningMessage(message,title,description){
    const errorEmbeded = new MessageEmbed()
        .setColor(16312092)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [errorEmbeded] });
}
function Error(message,error){
    let description;
    if(error.code === 'ECONNREFUSED')
        description = 'Look\'s like there is an issue with the interwebs on my end. Please create a ticket.';
    else
        description = 'An unknown error occured';
    console.log(message,error);

    const errorEmbeded = new MessageEmbed()
        .setColor(13632027)
        .setTitle('Error')
        .setDescription(description)
        .setTimestamp()
    message.reply({ embeds: [errorEmbeded] });
}

module.exports = {
    BankingBalance,
    Labor,
    CurrentDino,
    Error,
    ErrorMessage,
    SuccessMessage,
    WarningMessage,
}