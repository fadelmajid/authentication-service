'use strict';

let getLogData = (req, data) => {
    let IPFromRequest = req.connection.remoteAddress || ''
    let indexOfColon = IPFromRequest.lastIndexOf(':')
    let ipaddress = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length)

    let logdata = {
        "ipaddress": ipaddress || '',
        "route": req.originalUrl,
        "method": req.method || '',
        "headers": req.headers || '',
        "params": req.params || '',
        "body": req.body || '',
        "query": req.query || '',
        "response_data": data || ''
    }
    return logdata
}

module.exports = (fw) => {
    fw.use((req, res, next) => {
        res.success = (data, statusCode = 200) => {
            //clear connection everytime success
            if(req.db) {
                req.db.end()
            }

            // logging data
            let logdata = getLogData(req, data)
            myLogger.trace('response_success', JSON.stringify(logdata))

            res.status(statusCode).json({
                status: 'success',
                statusCode: statusCode,
                payload: data || {}
            });
        }

        res.plain = (data, statusCode = 200) => {
            //clear connection everytime success
            if(req.db) {
                req.db.end()
            }

            // logging data
            let logdata = getLogData(req, data)
            myLogger.trace('response_plain', JSON.stringify(logdata))

            res.status(statusCode).json(data);
        }

        res.error = (err, statusCode = 500) => {
            //clear connection everytime error
            if(req.db) {
                req.db.end()
            }

            //statusCode refer to this https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
            let data = {};
            // if err is string
            if (typeof err === 'string') {
                data = {
                    errors: [{
                        message: err
                    }]
                }
            }

            // if err is object
            if (typeof err === 'object') {
                if (!err.errors) {
                    let message = err.message;

                    err = JSON.parse(JSON.stringify(err));

                    err.message = message;

                    data = {errors: [err]}
                } else {
                    data = err;
                }
            }

            // logging data
            let logdata = getLogData(req, data)
            myLogger.trace('response_error', JSON.stringify(logdata))

            res.status(statusCode).json({
                status: 'error',
                statusCode: statusCode,
                payload: data
            });
        }

        res.notfound = (message) => {
            //clear connection everytime notfound
            if(req.db) {
                req.db.end()
            }

            // logging data
            let logdata = getLogData(req, message)
            myLogger.trace('response_notfound', JSON.stringify(logdata))

            res.status(404).json({
                status: 'error',
                statusCode: 404,
                payload: {
                    error: {
                        message: message
                    }
                }
            });
        }

        next();
    });
}