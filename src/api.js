process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require("express");
const serverless = require("serverless-http");

require('dotenv').config();

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH

const months = {
  0: "yanvar",
  1: "fevral",
  2: "mart",
  3: "aprel",
  4: "may",
  5: "iyun",
  6: "iyul",
  7: "avgust",
  8: "sentyabr",
  9: "oktyabr",
  10: "noyabr",
  11: "dekabr"
};

const app = express();
const router = express.Router();

router.get("/start", async (req, res) => {
  const { TelegramClient } = require("telegram");
  const { StringSession } = require("telegram/sessions");
  const request = require('request').defaults({strictSSL: false});
  
  const stringSession = new StringSession(process.env.LOG_STRING);
  
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
    connectionRetries: 5,
  });
  
  try {
    await client.connect();

    console.log("You should now be connected.");
  
    const date = new Date();

    request({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'user-agent': ''
      },
      uri: process.env.HOLIDAY_API + months[date.getUTCMonth()] + '/' + date.getDate(),
      method: 'GET'
    }, function (err, response, body) {
        if (err) throw err;
        
        const holidays = /празднуем: (.*?)и ещё/.exec(body)[1].split(', ');

        res.json({
          status: holidays
        })
    
        // const msgRes = await client.sendMessage(process.env.PHONE, { message: "Солнышко, улыбнись! Ведь сегодня мы с тобой отмечаем " + holidays[0] + '. ' + 'С ПРАЗДНИКОМ!!!' });
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