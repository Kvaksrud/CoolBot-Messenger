#!/usr/bin/env node

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
 */

// Load environment variables
require('dotenv').config(); // Include environment variables

// Run Discord Bot
require('./bot.js');

// Reserved for later health monitoring
// Run Express Server (npm install express)
/*
const express = require('express')
const app = express();

app.get('/ping', (req, res) => {
    console.log('Server was pinged');
    res.send('Hello World');
});

const port = process.env.PORT || 8800;

app.listen(port, () => {
    console.log(`listening on port, ${port}`);
});*/
