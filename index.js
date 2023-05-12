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

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  console.log("You should now be connected.");

  cron.schedule('*/10 * * * *', async () => {
    const date = new Date();

    request(process.env.HOLIDAY_API + months[date.getUTCMonth()] + '/' + date.getDate(), async (err, res, body) => {
      if (err) throw err;
      
      const holidays = /празднуем: (.*?)и ещё/.exec(body)[1].split(', ');

      await client.sendMessage('me', { message: "Солнышко, улыбнись! Ведь сегодня мы с тобой отмечаем " + holidays[0] + '. ' + 'С ПРАЗДНИКОМ!!!' });
    });
  });
})();