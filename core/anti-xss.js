'use strict'

const striptags = require('striptags')

exports.sanitizeMiddleware = (req, res, next) => {
    try {
        let targetSanitize = [req.body, req.query, req.params]
        targetSanitize.forEach((el) => el ? this.sanitizer(el) : el)
        next()
    } catch(e) {
        next('Sorry we have problem to sanitize this request!')
    }
}

exports.sanitizer = (data) => {
    let new_data
    if (data) {
        if (typeof data == 'object') {
            if (Array.isArray(data)) {
                new_data = data.map((obj) => this.sanitizer(obj))
            } else {
                for (let key in data) {
                    data[key] = this.sanitizer(data[key])
                }
                new_data = data
            }
        } else if (typeof data == 'string') {
            new_data = striptags(data)
        } else {
            new_data = data // handle number
        }
    }
    new_data = data ? new_data : data // return original data if data = 0 or null
    return new_data
}