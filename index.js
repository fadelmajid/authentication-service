'use strict';

require('dotenv').config();

// set application environment
global.ENV = process.env.NODE_ENV || 'development';

const port = process.env.PORT || 3000;
const express = require('express');
const fw = express();
const core = require('./core')(fw, __dirname);
core.init(__dirname, 'app');

console.log('listen to port : ', port);

fw.listen(port);

module.exports = fw
