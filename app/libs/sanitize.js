'use strict'

let obj = (rootpath) => {
    const cst = require(rootpath + '/config/const.json')
    const fn = {}

    fn.phoneNumber = (phone) => {
        try{
            let clean_phone = phone.replace(/[^0-9]+/g, "")

            if(clean_phone != '') {
                clean_phone = "0" == clean_phone.slice(0, 1) ? "+62" + clean_phone.substring(1) : "+" + clean_phone
            }
            return clean_phone
        }catch(e) {
            throw e
        }
    }

    fn.number = (number) => {
        try{
            let clean_number = number.replace(/[^0-9]+/g, "")
            return clean_number
        }catch(e) {
            throw e
        }
    }

    fn.pagingNumber = (page_no, no_per_page) => {
        try {
            let clean_page_no = (page_no && parseInt(page_no)) > 0 ? parseInt(page_no) : cst.page_no
            let clean_no_per_page = (no_per_page && parseInt(no_per_page)) > 0 ? parseInt(no_per_page) : cst.no_per_page

            return {
                page_no: clean_page_no,
                no_per_page: clean_no_per_page
            }
        } catch (e) {
            throw e
        }
    }

    fn.localPhoneNumber = (phone) => {
        try {
            let clean_phone = phone.replace(/[^0-9]+/g, "")

            if(clean_phone != '') {
                clean_phone = "62" == clean_phone.slice(0, 2) ? "0" + clean_phone.substring(2) : clean_phone
            }

            return clean_phone
        } catch (e) {
            throw e
        }
    }
    return fn
}

module.exports = obj