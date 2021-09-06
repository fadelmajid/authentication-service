"use strict"

let core = (fw) => {
    let $initialize = false

    // set framework options
    fw.set("x-powered-by", false)
    fw.set("trust proxy", true)

    // extend response
    require("./response.js")(fw)

    return {
        init: (rootpath, basepath) => {
            if ($initialize) {
                throw new Error("Application has been initialized!")
            }

            $initialize = true

            // load  middlewares
            require("./middlewares.js")(fw, rootpath, basepath)

            // load application
            let app = require(rootpath + "/" + basepath)

            // load core functions
            let fn = require("./functions.js")(fw, rootpath, basepath)

            app(fn)

            // non existing route
            fw.use((req, res) => {
                res.notfound("Page not found!")
            })

            // error handler
            fw.use((err, req, res, next) => {
                res.error(err)
            })
        }
    }
}

module.exports = core