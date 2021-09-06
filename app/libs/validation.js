'use strict'

let obj = (rootpath) => {
    const fn = {}

    fn.phoneNumber = (phone) => {
        try{
            let validator = require('validator')

            phone = loadLib('sanitize').phoneNumber(phone)

            // validate phone
            if(validator.isEmpty(phone)) {
                return false
            }

            // common phone number singapore is between 11-15 char (+65 9380 0787) & indonesia is between 12-15 char (+62817888160)
            if(phone.length < 11 || phone.length > 15) {
                return false
            }

            return true
        } catch(e) {
            throw e
        }
    }

    fn.localPhoneNumber = (phone) => {
        try{
            let validator = require('validator')

            phone = loadLib('sanitize').localPhoneNumber(phone)

            // validate phone
            if(validator.isEmpty(phone)) {
                return false
            }

            // common phone number is between 12-15 char (+62817888160)
            if(phone.length < 10 || phone.length > 13) {
                return false
            }

            return true
        } catch(e) {
            throw e
        }
    }

    fn.isValidEmail = (email) => {
        try{
            let disposable = require('disposable-email-domains')
            let validator = require('validator')

            if(validator.isEmpty(email)) {
                return false
            }
            if(validator.isEmail(email) == false) {
                return false
            }

            email = validator.normalizeEmail(email)

            let domain = email.split('@')[1]
            let found = disposable.find((row) => row == domain)
            if(found) {
                return false
            }

            return true
        } catch(e) {
            throw e
        }
    }

    fn.validName = (name) => {
        try{
            if (name.length < 3) {
                return false
            }

            return true
        } catch(e) {
            throw e
        }
    }

    return fn
}

module.exports = obj