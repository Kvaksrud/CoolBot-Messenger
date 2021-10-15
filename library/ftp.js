const config = require('../config.js'); // Config
const ftp = require('ftp'); // FTP Client
const fs = require('fs'); // File System Client

function getCurrentPlayerConfig(SteamID){
    return new Promise((resolve, reject) => {
        const cachePath = config.FTP.PLAYER_PROFILE_CACHE_PATH + SteamID + '.json';
        var c = new ftp();
        c.on('ready', function() {
            c.get('/players/' + SteamID + '.json', function(err, stream) {
            if (err) reject(err);
            stream.once('close', function() {
                c.end();
                const serverContent = fs.readFileSync(cachePath);
                const jsonServerContent = JSON.parse(serverContent);
                //console.log('Current dino',jsonServerContent);
                fs.unlinkSync(cachePath);
                resolve(jsonServerContent);
            });
            stream.pipe(fs.createWriteStream(cachePath));
            });
        });
        // connect to localhost:21 as anonymous
        c.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            port: process.env.FTP_PORT,
            password: process.env.FTP_PASSWORD,
            secure: config.FTP.SECURE,
            secureOptions: { rejectUnauthorized: config.FTP.ONLY_TRUSTED_CERTIFICATES }
        });
    })
}

function injectCurrentPlayerConfig(SteamID,Content){
    return new Promise((resolve,reject) => {
        const cachePath = config.FTP.PLAYER_PROFILE_CACHE_PATH + SteamID + '.json';
        const data = JSON.stringify(Content);
        fs.writeFileSync(cachePath, data); // TODO: Add try catch
        
        var c = new ftp();
        c.on('ready', function() {
            c.put(cachePath,'/players/' + SteamID + '.json', function(err) {
                if (err) reject(err);
                c.end();
                fs.unlinkSync(cachePath); // TODO: Add try catch
                resolve(true);
            });
        });
        // connect to localhost:21 as anonymous
        c.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            port: process.env.FTP_PORT,
            password: process.env.FTP_PASSWORD,
            secure: config.FTP.SECURE,
            secureOptions: { rejectUnauthorized: config.FTP.ONLY_TRUSTED_CERTIFICATES }
        });
    })
}

module.exports = {
    currentPlayerData: async (SteamID) => { return await getCurrentPlayerConfig(SteamID); },
    injectPlayerData: async (SteamID,Content) => { return await injectCurrentPlayerConfig(SteamID,Content); }
}