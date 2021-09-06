'use strict';

let loadMiddlewares = (app, rootpath, basepath) => {
    const bodyParser = require('body-parser');
    const antiXss = require('./anti-xss');
    const path = require('path');
    let objDB = require("./database.js")(rootpath)


    // body parser for json-encoded
    app.use(bodyParser.json({
        // maximum request body size
        // use https://www.npmjs.com/package/bytes as reference for defining byte calculation
        limit: '2000kb',
        'strict': false,
        type: '*/json'
    }));

    // body parser for url-encoded
    app.use(bodyParser.urlencoded({
        limit: '100kb',
        // parsing the URL-encoded data with the querystring library (false) or qs library (true)
        extended: false
    }));

    // apply xss prevention
    app.use(antiXss.sanitizeMiddleware)


    // connect database
    app.use(async (req, res, next) => {
        try {
            req.db = await objDB.getConnection()
            req.model = (filename) => {
                const url = path.normalize(rootpath + '/' + basepath + '/models/' + filename.toLowerCase() + '.js')
                return require(url)(objDB, req.db, rootpath)
            }
            next()
        } catch(e) {
            next(e)
        }
    })

    if (ENV !== 'production') {
        // for environment other than production
        let morgan = require('morgan');

        app.use(morgan('dev'));
    } else {
        // for environment only on production
    }
}

module.exports = loadMiddlewares;