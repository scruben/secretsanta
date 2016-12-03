'use strict';

const TelegramBot = require('node-telegram-bot-api');
const token = require('./token.json');

// Setup polling way
const bot = new TelegramBot(token.token, {polling: true});

bot.on('message', function (msg) {
  // if (msg.group_chat_created) {
  //   bot.getChatAdministrators(chatId).then(function(data) {
  //     chatAdmin = data[0].user.username;
  //   }).catch(function() {
  //     console.log('error on getChatAdministrators');
  //   })
  // }
  // if (msg.from.username === chatAdmin) {
  //
  //   if (theFinalPlayers.includes(msg.text)) {
  //     setTimeout (function () {
  //       bot.sendMessage(chatId, `Tournament ended. Congratulations to ${msg.text}!`);
  //     }, 600);
  //     let video = './messilegend.mp4';
  //     bot.sendVideo(chatId, video);
  //     let photo = './winner.gif';
  //     bot.sendDocument(chatId, photo, {caption: "Who's next?"});
  //     theFinalPlayers = [];
  //   }
  //
  //   if (playingPlayers.includes(msg.text)) {
  //     let winner = msg.text;
  //     // winner goes to next round
  //     newT.passRound(winner);
  //     let nextMatch = newT.nextMatch();
  //     if (nextMatch.round === 'final') {
  //       theFinalPlayers = [nextMatch.player1, nextMatch.player2];
  //       bot.sendMessage(chatId, `FINAL MATCH: ${nextMatch.player1} VS ${nextMatch.player2}`);
  //       let opts = {
  //         reply_markup: JSON.stringify({
  //           keyboard: [theFinalPlayers],
  //           one_time_keyboard: true,
  //           resize_keyboard: true
  //         })
  //       };
  //       setTimeout (function () {
  //         bot.sendMessage(chatId, `Who is the CHAMPION? Choose the winner by clicking the button below.`, opts);
  //       }, 600);
  //       myState.registring = false;
  //       myState.playing = false;
  //       newT = undefined;
  //       players = [];
  //       playingPlayers = [];
  //     } else {
  //         playingPlayers = [nextMatch.player1, nextMatch.player2];
  //         bot.sendMessage(chatId, `Next Match: ${nextMatch.player1} VS ${nextMatch.player2}`);
  //         let opts = {
  //           reply_markup: JSON.stringify({
  //             keyboard: [playingPlayers],
  //             one_time_keyboard: true,
  //             resize_keyboard: true
  //           })
  //         };
  //         setTimeout (function () {

  console.log(msg);
  let chatId = msg.chat.id;
  bot.sendMessage(chatId, `Hi!`);

});

// Matches /start command
bot.onText(/\/start/, function (msg, match) {
//   let chatId = msg.chat.id;
//   let respNew = `
//     *Welcome!*
//
// Before we start the tournament, every player has to register.
//
// Please type /register to register at the tournament.
// Every player has to send /register.
//
// When ready, the administrator has to type /go to start the tournament.
//
// Players can send /next to know the next opponent.
//
//     `;
//     if (msg.from.username === chatAdmin) {
//       if (myState.playing === false) {
//         if (myState.registring === false){
//           myState.registring = true;
//           bot.sendMessage(chatId, respNew, {parse_mode: 'Markdown'});
//         } else {
//           bot.sendMessage(chatId, 'You are already registering in a tournament. Send /go to start when all players are registered.');
//         }
//       } else {
//         bot.sendMessage(chatId, `Can't play more than one tournament at once`);
//       }
//     } else {
//       bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
//     }
});

bot.onText(/\/help/, function (msg, match) {
  let chatId = msg.chat.id;
//   let resp = `
//     To start a tournament you have to add me to a Telegram group.
//
// Then type /start to start a tournament!
// Every player has to register before the tournament starts.
// Once the tournament has started, only the group administrator can send me commands, except /next.
// Players can type /next to know the next opponent.
//
// You can control me by sending these commands:
//
//   /start - start the registration process
//   /register - register at the tournament
//   /go - start the tournament
//   /help - list of commands and help
//   /deletetournament - delete an existing tournament
//   /next - show next opponent
//
//     `;
//     if (msg.from.username === chatAdmin) {
//     bot.sendMessage(chatId, resp, {parse_mode: 'Markdown'});
//     } else {
      bot.sendMessage(chatId, `Help`);
//     }
});
