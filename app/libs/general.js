'use strict'

let obj = (rootpath) => {
    const fn = {}

    fn.showDate = (date) => {
        try{
            let moment = require('moment')
            return moment(date.toString()).format("DD/MM/YYYY HH:mm")
        }catch(e) {
            throw e
        }
    }

    fn.numberFormat = (n) => {
        let parts = n.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (parts[1] ? "," + parts[1] : "");
    }

    return fn
}

module.exports = obj