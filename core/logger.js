'use strict';

module.exports = (filelog, category, maxLogSize, backups, setLevel) => {

    let log4js = require('log4js');
    let config = '{"pm2":true, "pm2InstanceVar": "INSTANCE_ID", "appenders": {"' + category + '": {"type": "file", "filename": "' + filelog + '", "maxLogSize": ' + maxLogSize + ', "backups": ' + backups + '}}, "categories": {"default": {"appenders": ["' + category + '"], "level": "' + setLevel + '"}} }'
    config = JSON.parse(config)
    log4js.configure(config)

    let logger = log4js.getLogger(category);

    let myLogger = {};

    // how to use :
    // myLogger.trace('lorem', string);
    // myLogger.trace('lorem', obj);
    // myLogger.trace('lorem', array);
    myLogger.trace = (action, message) => {
        myLogger.push('trace', action, message);
    };

    // how to use :
    // myLogger.debug('lorem', string);
    // myLogger.debug('lorem', obj);
    // myLogger.debug('lorem', array);
    myLogger.debug = (action, message) => {
        myLogger.push('debug', action, message);
    };

    // how to use :
    // myLogger.info('lorem', string);
    // myLogger.info('lorem', obj);
    // myLogger.info('lorem', array);
    myLogger.info = (action, message) => {
        myLogger.push('info', action, message);
    };

    // how to use :
    // myLogger.warn('lorem', string);
    // myLogger.warn('lorem', obj);
    // myLogger.warn('lorem', array);
    myLogger.warn = (action, message) => {
        myLogger.push('warn', action, message);
    };

    // how to use :
    // myLogger.error('lorem', string);
    // myLogger.error('lorem', obj);
    // myLogger.error('lorem', array);
    myLogger.error = (action, message) => {
        myLogger.push('error', action, message);
    };

    // how to use :
    // myLogger.fatal('lorem', string);
    // myLogger.fatal('lorem', obj);
    // myLogger.fatal('lorem', array);
    myLogger.fatal = (action, message) => {
        myLogger.push('fatal', action, message);
    };


    myLogger.push = (type, action, message) => {

        let newData = {"action": action, "data-log": message};
        if(type == 'trace') {
            logger.trace(newData);
        }else if(type == 'debug') {
            logger.debug(newData);
        }else if(type == 'info') {
            logger.info(newData);
        }else if(type == 'warn') {
            logger.warn(newData);
        }else if(type == 'error') {
            logger.error(newData);
        }else if(type == 'fatal') {
            logger.fatal(newData);
        }
    };

    return myLogger;
}
