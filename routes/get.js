var express = require('express');
var Router = express.Router();
var get = require('../controllers/get');

Router.get('/one',get.one);
Router.get('/two',get.two);
Router.get('/three',get.three);
Router.get('/four',get.four);
Router.get('/five',get.five);
Router.get('/fiveOne',get.fiveOne);
Router.get('/exit',get.loginExit);
Router.get('/nowexit',get.nowexit);
Router.get('/ball',get.ball);
Router.get('/isLogin',get.isLogin);
Router.get('/commetTake',get.commetTake);
Router.get('/random',get.random);
Router.get('/alterUser',get.alterUser);
Router.get('/alterComment',get.alterComment);
Router.get('/users',get.users);
Router.get('/userItem',get.userItem);
Router.get('/userHistory',get.userHistory);
Router.get('/isAdmin',get.isAdmin);



module.exports = Router;