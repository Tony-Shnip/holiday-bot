process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require("express");
const serverless = require("serverless-http");

require('dotenv').config();

const app = express();
const router = express.Router();

router.get("/start", async (req, res) => {
  const iconv = require('iconv-lite');
  const { TelegramClient } = require("telegram");
  const { StringSession } = require("telegram/sessions");
  const request = require('request').defaults({strictSSL: false});
  
  const apiId = process.env.API_ID;
  const apiHash = process.env.API_HASH
  const stringSession = new StringSession(process.env.LOG_STRING);
  
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
    connectionRetries: 5,
  });
  
  try {
    await client.connect();

    console.log("You should now be connected.");

    request({
      method: 'GET',
      uri: process.env.HOLIDAY_API,
      encoding: 'binary'
    }, 
      async function (err, response, body) {
        if (err) throw err;

        const message = iconv.encode(iconv.decode(body, "cp1251"), "utf8").toString();
    
        await client.sendMessage(process.env.PHONE, {message: message.split('<content>')[1].split('</content>')[0]});

        res.send('Done')
    });
  } catch (err) {
    res.json({
      error: err
    })
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);