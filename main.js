'use strict';

const TelegramBot = require('node-telegram-bot-api');
const nconf = require('nconf');
// const token = require('./token.json');

nconf.argv()
   .env()
   .file({ file: './token.json' });

var events = [];

// Setup polling way
const bot = new TelegramBot(nconf.token, {polling: true});

bot.on('message', function (msg) {

  if ( msg.text.toLowerCase() === '/start' && msg.chat.id > 0) {
    for (var i = 0; i < events.length; i++) {
      for (var j = 0; j < events[i].users.length; j++) {
        if (events[i].users[j].username === msg.from.username) {
          // Where magic happens
          bot.sendMessage(msg.chat.id, `And you'll give the present to : *${events[i].users[j].receiver}*`,{parse_mode: 'Markdown'});
          bot.sendMessage(msg.chat.id, `If you want to give some suggestions for your own gift... type for ex.
            I like skiing
            I like books
            I like ...

            To know what ${events[i].users[j].receiver} likes, type /suggestions every now and then
            `);
          return;
        }
      }
    }
  }

  if (msg.chat.id < 0) {
    let posEvent = getEvent(msg.chat.id);
    if (posEvent != undefined && posEvent >= 0) {
      if (msg.from.username === events[posEvent].chatAdmin){
        if (events[posEvent].maxPrice === undefined && !isNaN(msg.text)) {
          events[posEvent].maxPrice = msg.text;
          bot.sendMessage(msg.chat.id, `The price of the gift is set to ${msg.text}$`);
        } else if (events[posEvent].maxPrice === undefined && isNaN(msg.text)) {
          bot.sendMessage(msg.chat.id, `The maximum price is 20$ by default`);
          events[posEvent].maxPrice = 20;
        }
      }
    }
  }

});

bot.onText(/I like/, function (msg, match) {
  let message = msg.text.substr(7);
  for (var i = 0; i < events.length; i++) {
    for (var j = 0; j < events[i].users.length; j++) {
      if (events[i].users[j].username === msg.from.username) {
        if (events[i].users[j].ownSuggs) events[i].users[j].ownSuggs.push(message);
        else events[i].users[j].ownSuggs=[message];
      }
    }
  }
});

bot.onText(/\/suggestions/, function (msg, match) {
  for (var i = 0; i < events.length; i++) {
    for (var j = 0; j < events[i].users.length; j++) {
      if (events[i].users[j].username === msg.from.username) {
        // if (events[i].users[j].ownSuggs) events[i].users[j].ownSuggs.push(message);
        // else events[i].users[j].ownSuggs=[message];
        let receiver = events[i].users[j].receiver;
        for (var m = 0; m < events.length; m++) {
          for (var n = 0; n < events[m].users.length; n++) {
            if (events[m].users[n].username === receiver && events[m].users[n].ownSuggs) {
              bot.sendMessage(msg.chat.id, `${receiver} likes ${events[m].users[n].ownSuggs.join(', ')}`);
            }
          }
        }
      }
    }
  }
});

// Matches /begin command
bot.onText(/\/begin/, function (msg, match) {
  if (msg.chat.id < 0) {
    if (getEvent(msg.chat.id)<0) {
      console.log('new Event');
      let newEvent = {};
      newEvent.chatId = msg.chat.id;
      newEvent.chatAdmin = msg.from.username;
      newEvent.chatAdminName = msg.from.first_name;
      newEvent.date = undefined;
      newEvent.maxPrice = undefined;
      newEvent.users = [];
      newEvent.isOpen = true;
      events.push(newEvent);
      let answer = ``;
      setTimeout (function () {
        bot.sendMessage(msg.chat.id, `Ok, let's start. Anyone who wants to participate should use the command /register`);
      }, 600);
      bot.sendMessage(msg.chat.id, `${newEvent.chatAdminName}, can you tell me the maximum price for the gift, please? (Just type a number... the price by default is 20$)`);
    } else {
      bot.sendMessage(msg.chat.id, `A Secret Santa has already started!`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

bot.onText(/\/cancel/, function (msg, match) {
  if (msg.chat.id < 0) {
    let chatId = msg.chat.id;
    let i = getEvent(chatId);
    // events = events.splice(i,1);
    events = [];
    bot.sendMessage(chatId, `Cancelled Secret Santa`);
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

bot.onText(/\/secret/, function (msg, match) {
  let chatId = msg.chat.id;
  bot.sendMessage(chatId, `Don't tell anyone... I am the parents!`);
});

bot.onText(/\/status/, function (msg, match) {
  if (msg.chat.id < 0) {
    let chatId = msg.chat.id;
    let event = getEvent(chatId);
    if (event>=0) {
      console.log(events[event]);
      bot.sendMessage(chatId, JSON.stringify(events[getEvent(chatId)]));
    } else {
      bot.sendMessage(chatId, 'No Secret Santa yet');
    }
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

bot.onText(/\/register/, function (msg, match) {
  if (msg.chat.id < 0) {
    let chatId = msg.chat.id;
    let user = msg.from.username;
    for (let i = 0; i < events.length; i++) {
      if (chatId === events[i].chatId) {
        if (events[i].isOpen) {
          let found = false;
          for (var j = 0; j < events[i].users.length; j++) {
            if (events[i].users[j].username === user) found = true;
          }
          if (found) {
            bot.sendMessage(chatId, `You can't join more than once!`);
          } else {
            events[i].users.push({username: user});
            let resp = `${user} has joined the Secret Santa event!
  ${events[i].users.length} people has joined!`;
            bot.sendMessage(chatId, resp);
          }
        } else {
          bot.sendMessage(chatId, `Registrations are closed. /start a new lottery if you haven't yet.`);
        }
      }
    }
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

bot.onText(/\/help/, function (msg, match) {
  if (msg.chat.id < 0) {
    let chatId = msg.chat.id;
    let resp = `

    Hello! I'm Santa! I hope your Christmas Spirit is on fire!!
    I'll guide you to the North Pole and give you some ideas for
    the gift that you have to send to your secret friend.

      Group chat commands->
      /start - Start as admin a new Secret Santa event
      /register - Sign up at the Secret Santa event
      /go - (only admin) Start the lottery to know who's
      /help - list of commands and help
      /cancel - delete the Secret Santa in case you made some mistake.

      when you finish your register, you can start a private chat with
      @santacw_bot and he will tell you your next step!!!

      `;

    bot.sendMessage(chatId, resp);
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

bot.onText(/\/go/, function (msg, match) {
  if (msg.chat.id < 0) {
    let chatId = msg.chat.id;
    let posEvent = getEvent(chatId);
    if (events[posEvent].chatAdmin !== msg.from.username) {
      bot.sendMessage(chatId, `Only ${events[posEvent].chatAdminName} can use /go to make the lottery!`);
    } else{
      shuffle(events[posEvent].users);
      for (var i = 0; i < events[posEvent].users.length; i++) {
        if (i<events[posEvent].users.length-1) events[posEvent].users[i].receiver = events[posEvent].users[i+1].username;
        else events[posEvent].users[i].receiver = events[posEvent].users[0].username;
      }
      events[posEvent].isOpen = false;
      bot.sendMessage(chatId, `Great! The lottery is done! Start a private chat with @santacw_bot and he will tell you your next step!!!`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `This command is only for group chats!`);
  }
});

const getEvent = (chatId) => {
  for (var i = 0; i < events.length; i++) {
    if (events[i].chatId === chatId) return i;
  }
  return -1;
};

const shuffle = function (array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
