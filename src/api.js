const express = require("express");
const serverless = require("serverless-http");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const cron = require('node-cron');
const request = require('request');

require('dotenv').config();

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH
const stringSession = new StringSession(process.env.LOG_STRING);

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

router.get("/start", (req, res) => {
  (async () => {
    console.log("Loading interactive example...");
    const client = new TelegramClient(stringSession, Number(apiId), apiHash, {
      connectionRetries: 5,
    });
  
    await client.connect();
  
    console.log("You should now be connected.");
  
    const date = new Date();

    request(process.env.HOLIDAY_API + months[date.getUTCMonth()] + '/' + date.getDate(), async (err, res, body) => {
      if (err) throw err;
      
      const holidays = /празднуем: (.*?)и ещё/.exec(body)[1].split(', ');

      await client.sendMessage('me', { message: "Солнышко, улыбнись! Ведь сегодня мы с тобой отмечаем " + holidays[0] + '. ' + 'С ПРАЗДНИКОМ!!!' });
    });
    res.json({
      holiday: new Date().getDate()
    })
  })();
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);