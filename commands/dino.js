require('dotenv').config(); // Include environment variables
const config = require('./../config.js'); // Config
const lang = require('./../lang/default.js'); // Config
const backend = require('./../library/backend.js'); // API / Database
const ftp_commands = require('./../library/ftp.js');
const templates = require('./../library/dinoTemplates.js');

const regexp_gender = new RegExp(config.REGEX.GENDER);

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
            console.log('Unknown error from FTP command');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-DINO``').catch((errD) => {
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
        reply.edit('You are not registered');
        return;
    }
    if(args.length === 0){ // !dino (no args)
        //console.log('Reply: ',reply);
        console.log(registrationStatus.data.item.steam_id);
        ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
            console.log(result);
            reply.edit('```Class: '+result.CharacterClass+'\nGrowth: '+result.Growth+'\nGender: '+ (result.bGender === true ? 'Female' : 'Male') +'```');
        }).catch((err) => {
            if(err.code === 550)
                reply.edit('You do not have an active dino on our server.\nLog in to the server and safe-log to save your progress.').catch((errD) => {
                    console.log('Discord Error:')
                    console.error(errD);
                });
            else if(err.code === 'ECONNREFUSED'){
                console.error(err);
                reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                    console.log('Discord Error:')
                    console.error(errD);
                });
            } else {
                console.log('Unknown error from FTP command');
                console.error(err);
                reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-DINO``').catch((errD) => {
                    console.log('Discord Error:')
                    console.error(errD);
                });
            };
            
        });
        return;
    } else if(args[0] === 'inject'){ // !dino inject <dino> <gender>
        if(templates.InjectionNames.includes(args[1]) !== true){
            reply.edit('Invalid dino selection.\n```Valid selection: ' + templates.InjectionNames.sort().join(', ') + '\nExample: !dino inject trike f```');
            return;
        }
        if(regexp_gender.test(args[2]) !== true){
            reply.edit('You must select a gender.\n```Valid selection: m, f\nExample: !dino inject trike f```');
            return;
        }

        await reply.edit('Please wait while I do some magic! Cast time is a little long, hold on :)');
        const currentPlayer = await ftp_commands.currentPlayerData(registrationStatus.data.item.steam_id).then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
            reply.edit('I\'m having issues trying to figure out your current player configuration. Please try again later.');
            return;
        });
        
        console.log('currentPlayer = ',currentPlayer);
        const templatedDino = templates.generate(args[1],args[2],currentPlayer);
        console.log('templateDino = ',templatedDino);

        const injection = await ftp_commands.injectPlayerData(registrationStatus.data.item.steam_id,templatedDino).then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
            reply.edit('I\'m having issues trying to inject your dinosaur. Please try again later.');
            return;
        })

        if(injection === true){
            reply.edit('Your dino has been successfully injected! You can now log in to the server.');
            await backend.storeCharacterSheet(message.guild.id,message.member.id,templatedDino,'injection').catch((err) => {
                console.log('Failed to log injection')
                console.error(err);
            })
            return;
        }
        
    } else { // Invalid command
        reply.edit('Invalid command');
    }
    return;
}

module.exports = {
    handle
};