var express = require('express');
var Router = express.Router();
var post = require('../controllers/post');

Router.post('/',post.one);
Router.post('/login',post.login);
Router.post('/signin',post.signin);
Router.post('/submitText',post.submitText);

module.exports = Router;