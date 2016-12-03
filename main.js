'use strict';
//name: Big-T
//username: DChamp_Bot

const TelegramBot = require('node-telegram-bot-api');
const token = require('./token.js');
const tournament = require('./tournament.js');

// Setup polling way
const bot = new TelegramBot(token, {polling: true});

let myState = {
  registring: false,
  playing: false
}

let chatAdmin = "johnandblue";
let players = ['1','2','3','4']
let newT;
let chatId = -155151883;
let playingPlayers = [];
let theFinalPlayers = [];

// bot.on('inline_query', function(msg){
//   console.log(msg);
//   console.log(msg.id);
//   // queryId = msg.id;
//   bot.answerInlineQuery(msg.id, [{
//           inline_query: JSON.stringify({ 
//             type: 'gif',
//             id: 1,
//             gif_url: './winner.gif',
//             thumb_url: './winner.gif'
//           })
//         }]);
// });

bot.on('message', function (msg) {
  if (msg.group_chat_created) {
    chatId = msg.chat.id;
    bot.getChatAdministrators(chatId).then(function(data) {
      chatAdmin = data[0].user.username;
    }).catch(function() {
      console.log('error on getChatAdministrators');
    })
  }
  if (msg.from.username === chatAdmin) {

    if (theFinalPlayers.includes(msg.text)) {
      setTimeout (function () { 
        bot.sendMessage(chatId, `Tournament ended. Congratulations to ${msg.text}!`);
      }, 600); 
      let video = './messilegend.mp4';
      bot.sendVideo(chatId, video);      
      let photo = './winner.gif';
      bot.sendDocument(chatId, photo, {caption: "Who's next?"});
      theFinalPlayers = [];
    }

    if (playingPlayers.includes(msg.text)) {
      let winner = msg.text;
      // winner goes to next round
      newT.passRound(winner);
      let nextMatch = newT.nextMatch();
      if (nextMatch.round === 'final') {
        theFinalPlayers = [nextMatch.player1, nextMatch.player2];
        bot.sendMessage(chatId, `FINAL MATCH: ${nextMatch.player1} VS ${nextMatch.player2}`);
        let opts = {
          reply_markup: JSON.stringify({ 
            keyboard: [theFinalPlayers],
            one_time_keyboard: true,
            resize_keyboard: true
          })
        };
        setTimeout (function () { 
          bot.sendMessage(chatId, `Who is the CHAMPION? Choose the winner by clicking the button below.`, opts);
        }, 600);
        myState.registring = false;
        myState.playing = false;
        newT = undefined;
        players = [];
        playingPlayers = [];
      } else {
          playingPlayers = [nextMatch.player1, nextMatch.player2];
          bot.sendMessage(chatId, `Next Match: ${nextMatch.player1} VS ${nextMatch.player2}`);
          let opts = {
            reply_markup: JSON.stringify({ 
              keyboard: [playingPlayers],
              one_time_keyboard: true,
              resize_keyboard: true
            })
          };
          setTimeout (function () { 
            bot.sendMessage(chatId, `Who won the match? Choose the winner by clicking the button below.`, opts);    
        }, 600);
        }
    }
  }
});

// Matches /start command
bot.onText(/\/start/, function (msg, match) {
  let chatId = msg.chat.id;
  let respNew = `
    *Welcome!*

Before we start the tournament, every player has to register.

Please type /register to register at the tournament.
Every player has to send /register.

When ready, the administrator has to type /go to start the tournament.

Players can send /next to know the next opponent.
    
    `;
    if (msg.from.username === chatAdmin) {
      if (myState.playing === false) {
        if (myState.registring === false){
          myState.registring = true;  
          bot.sendMessage(chatId, respNew, {parse_mode: 'Markdown'});
        } else {
          bot.sendMessage(chatId, 'You are already registering in a tournament. Send /go to start when all players are registered.');          
        }
      } else {
        bot.sendMessage(chatId, `Can't play more than one tournament at once`);
      }
    } else {
      bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
    }
});

bot.onText(/\/help/, function (msg, match) {
  let chatId = msg.chat.id;
  let resp = `
    To start a tournament you have to add me to a Telegram group.
    
Then type /start to start a tournament!
Every player has to register before the tournament starts.
Once the tournament has started, only the group administrator can send me commands, except /next.
Players can type /next to know the next opponent.

You can control me by sending these commands:

  /start - start the registration process
  /register - register at the tournament
  /go - start the tournament
  /help - list of commands and help
  /deletetournament - delete an existing tournament
  /next - show next opponent
    
    `;
    if (msg.from.username === chatAdmin) {
    bot.sendMessage(chatId, resp, {parse_mode: 'Markdown'});
    } else {
      bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
    }
});

// I have to implement newtournament
bot.onText(/\/register/, function (msg, match) {
  let chatId = msg.chat.id;
  let user = msg.from.username;
  if (myState.registring === true) {
    if (players.indexOf(user) === -1) {
      players.push(user);
      let resp = `
        ${user} has been registered! 
Current players registered: ${players.length}
      `;
    bot.sendMessage(chatId, resp);
    } else { bot.sendMessage(chatId, `You can't register more than once!`)}
  } else {
    bot.sendMessage(chatId, `Registrations are closed. /start a tournament if you haven't yet.`);
  }
});

bot.onText(/\/next/, function (msg, match) {
  let chatId = msg.chat.id;
  let user = msg.from.username;
  if (myState.playing === true) {
    if (players.includes(user) || playingPlayers.includes(user) || theFinalPlayers.includes(user)) {
      let opponent = newT.nextOpponent(user);
      let resp = `
        ${user} your opponent is ${opponent} 
      `;
    bot.sendMessage(chatId, resp);
    } else { bot.sendMessage(chatId, `You are not playing the current tournament`)}
  } else {
    bot.sendMessage(chatId, `Not playing any tournament yet.`);
  }
});

bot.onText(/\/go/, function (msg, match) {
  let chatId = msg.chat.id;
  if (msg.from.username === chatAdmin) {
  
  // check number of players to start
  if (players.length < 4) {
    bot.sendMessage(chatId, `You need at least 4 players to start a tournament and you are only ${players.length}!`);
  } else {
    //set states, create and show the tournament
      myState.registring = false;
      myState.playing = true;
      let number = players.length;
      newT = tournament.createTournament(players);
      bot.sendMessage(chatId, `New tournament created with ${number} players! Start!`);

      // shows next match and ask for the winner
      let nextM = newT.nextMatch();
      playingPlayers = [nextM.player1, nextM.player2];
      bot.sendMessage(chatId, `Next Match: ${nextM.player1} VS ${nextM.player2}`);
      let opts = {
        reply_markup: JSON.stringify({ 
          keyboard: [playingPlayers],
          one_time_keyboard: true,
          resize_keyboard: true
        })
      };
      setTimeout (function () { 
        bot.sendMessage(chatId, `Who won the match? Choose the winner by clicking the button below.`, opts);    
      }, 600);
    }
  } else {
      bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);  
  }
});

bot.onText(/\/deletetournament/, function (msg, match) {
  let chatId = msg.chat.id;
  let opts = {
    reply_markup: JSON.stringify({ 
    keyboard: [[`YES`, `NO`]],
    one_time_keyboard: true,
    resize_keyboard: true
    })
  };
  if (msg.from.username === chatAdmin) {
    if (myState.playing === true) {
      bot.sendMessage(chatId, `Are you sure?`, opts);
      bot.onText(/YES/, function (msg, match) {
        if (msg.from.username === chatAdmin) {
          myState.registring = false;
          myState.playing = false;
          newT = undefined;
          players = [];
          playingPlayers = [];
          bot.sendMessage(chatId, `Current tournament deleted`);
        }
      })
      bot.onText(/NO/, function (msg, match) {
        if (msg.from.username === chatAdmin) {
          bot.sendMessage(chatId, `The tournament has not been deleted`);
        }
      })
    } else {
      bot.sendMessage(chatId, `You are not playing any tournament!`);
    }
  } else {
    bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
  }
});
