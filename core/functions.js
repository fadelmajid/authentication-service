'use strict'

let fn = (fw, rootpath, basepath) => {
    const path = require('path')
    const fn = {}

    // attach rootpath and basepath
    fn.rootpath = rootpath
    fn.basepath = basepath

    // set main router
    fn.router = (param) => {
        const router = require('express').Router()

        param(fn, router)

        fw.use(router)
    }

    // require a route file
    fn.route = (routeName, authController) => {
        let routes = require(path.normalize(rootpath + '/' + basepath + '/routes/' + routeName.toLowerCase() + '.js'))

        const router = require('express').Router()

        let routing = routes(fn)
        routing.forEach((el) => {

            let argsArray = []
            //push route path
            argsArray.push(el.route)

            //looping inits
            //middleware that will be execute before auth checking
            for(let i = 0, len = el.inits.length; i < len; i++) {
                argsArray.push(el.inits[i])
            }

            //add auth checker middleware if auth == true
            if(el.auth == 'yes') {
                argsArray.push(authController.checkVersion)
                argsArray.push(authController.checkToken)
            }else if(el.auth == 'login') {
                argsArray.push(authController.checkVersion)
                argsArray.push(authController.checkLogin)
            }

            //looping middlewares
            for(let i = 0, len = el.middlewares.length; i < len; i++) {
                argsArray.push(el.middlewares[i])
            }
            router[el.method].apply(router, argsArray)
        })

        return router
    }

    // require a controller file
    fn.controller = (filename) => require(path.normalize(rootpath + '/' + basepath + '/controllers/' + filename.toLowerCase() + '.js'))(rootpath)

    // set global lib function on framework request object
    global.loadLib = (filename) => require(path.normalize(rootpath + '/' + basepath + '/libs/' + filename.toLowerCase() + '.js'))(rootpath)

    // set global message by code
    global.getMessage = (code, replacement) => {
        //copy & paste "en" language to another lang if you want to activate multiple language
        let langEn = require(path.normalize(rootpath + '/' + basepath + '/lang/en.json'))
        let objMessage = {
            "code": code,
            "en": code
        }
        let msg = langEn.filter((row) => row[code] !== undefined).map((row) => row[code]).toString()

        // replace with regex
        if(typeof replacement === 'string') {
            msg = msg.replace(/%s/ig, replacement)
        }else if(typeof replacement === 'object') {
            for(let i = 0, len = replacement.length; i < len; i++) {
                msg = msg.replace(/%s/i, replacement[i])
            }
        }

        // return object
        objMessage.en = msg != '' ? msg : code
        return objMessage
    }

    // set function isEmpty
    global.isEmpty = (data) => {
        for (let item in data) {
            return false
        }
        return true
    }

    // set logger
    global.myLogger = require('./logger.js')("logs/assignment.log", 'assignment', 50000000, 10, 'trace');

    return fn
}

module.exports = fn
