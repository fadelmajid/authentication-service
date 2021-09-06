'use strict'
let obj = (objDB, db, rootpath) => {
    const tbl = require(rootpath + '/config/tables.json')
    const cst = require(rootpath + '/config/const.json')
    const config = require(rootpath + "/config/config.json")
    const fn = {}
    let moment = require('moment')
    const crypto = require('crypto')

    // BEGIN CUSTOMER
    fn.getCustomer = async (id) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer + " WHERE customer_id = $1 LIMIT 1"

        let rows = await db.query(sql, [id])
        return rows.rows[0]
    }

    fn.getCustomerEmail = async (email) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer + " WHERE customer_email = $1 LIMIT 1"

        let row = await db.query(sql, [email])
        return row.rows[0]
    }

    fn.getCustomerPhone = async (phone) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer + " WHERE customer_phone = $1 ORDER BY customer_id DESC LIMIT 1"

        let rows = await db.query(sql, [phone])
        return rows.rows[0]
    }

    fn.getCustomerUsername = async (phone) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer + " WHERE customer_username = $1 ORDER BY customer_id DESC LIMIT 1"

        let rows = await db.query(sql, [phone])
        return rows.rows[0]
    }

    fn.getCustomerCode = async (code) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer + " WHERE customer_code = $1 LIMIT 1"

        let rows = await db.query(sql, [code])
        return rows.rows[0]
    }

    fn.getAllCustomer = async (where = '', data = [], order_by = " customer_id ASC ", limit = 0) => {
        let sql = "SELECT * FROM " + tbl.customer + " WHERE 1=1 " + where + " ORDER BY " + order_by

        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }

    fn.insertCustomer = async (data) => {
        let res = await objDB.insert(db, tbl.customer, data, "customer_id")
        return res
    }

    fn.updateCustomer = async (id, data) => {
        let where = {'cond': 'customer_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer, where, data)
    }

    fn.uploadImage = async (id, data) => {
        let where = {'cond': 'customer_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer, where, data)
    }

    fn.generateRefCode = (string) => {
        let moment = require('moment')
        const crypto = require('crypto')
        // notes : function untuk generate referral code per customer
        const mili = moment().millisecond()
        const rstr = '_' + Math.random().toString(36).substr(2, 9)
        let unique = crypto.createHash('sha256').update(mili + string + rstr).digest("hex")
        return unique.substr(2, 6).toUpperCase()
    }

    fn.getUniqueCode = async (string) => {
        // generate & validate unik access token
        let referral_code = fn.generateRefCode(string)
        return referral_code
    }
    // END CUSTOMER

    // START DATA
    fn.insertCustomerData = async (data) => {
        let res = await objDB.insert(db, tbl.customer_data, data, "customer_data_id")
        return res
    }

    fn.getCustomerData = async (id) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer_data + " WHERE customer_data_id = $1 AND is_deleted = false LIMIT 1"

        let rows = await db.query(sql, [id])
        return rows.rows[0]
    }

    fn.updateCustomerData = async (id, data) => {
        let where = {'cond': 'customer_data_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer_data, where, data)
    }

    fn.deleteSoftCustomerData = async (id, data) => {
        let where = {'cond': 'customer_data_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer_data, where, data)
    }

    fn.deleteCustomerData = async (id) => {
        let where = {"cond": "customer_data_id = $1", "bind": [id]}
        return await objDB.delete(db, tbl.customer_data, where)
    }

    fn.getAllCustomerData = async (where = '', data = [], order_by = " customer_data_id ASC ", limit = 0) => {
        let sql = "SELECT * FROM " + tbl.customer_data + " WHERE 1=1 " + where + " ORDER BY " + order_by

        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }

    fn.getPagingCustomerData = async (where = '', data = [], order_by = " customer_data_id ASC ", page_no = 0, no_per_page = 0) => {
        let paging = loadLib('sanitize').pagingNumber(page_no, no_per_page)
        let sql = "SELECT customer_data.* FROM " + tbl.customer_data + " WHERE 1=1 " + where + " ORDER BY " + order_by
        let result = await objDB.getPaging(db, sql, data, paging.page_no, paging.no_per_page)
        return result
    }
    // END DATA

    // BEGIN REGISTRATION
    fn.registration = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const authModel = require('./auth.js')(objDB, db, rootpath)
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const {name, username, email, phone, id_number, birthday, password, objToken} = data
        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // create lock_transaction data
            await ltModel.insertRegister('Insert new customer, name ' + name + ', email ' + email + ', phone' + phone + ', birthday' + birthday)

            let data = {
                "customer_name": name,
                "customer_username": username,
                "customer_code": await fn.getUniqueCode(email),
                "customer_email": email,
                "customer_phone": phone,
                "customer_identification_id": id_number,
                "customer_birthday": birthday,
                "customer_password": password,
                "customer_status": "active",
                "last_login": now,
                "created_date": now
            }
            let customer_id = await fn.insertCustomer(data)
            let detailCustomer = await fn.getCustomer(customer_id.customer_id)

            // update column customer_id in auth_token
            data = {
                "customer_id": detailCustomer.customer_id,
                "updated_date": now
            }
            await authModel.updateToken(objToken.atoken_id, data)

            //double validation, karena sering terjadi race condition
            let allCustomers = await fn.getAllCustomer(" AND customer_phone = $1 ", [phone])

            if(allCustomers.length > 1) {
                throw getMessage('auth016')
            }

            //COMMIT
            await db.query('COMMIT')

            return detailCustomer
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            throw e
        }
    }
    // END REGISTRATION

    //BEGIN LOGIN
    fn.login = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const authModel = require('./auth.js')(objDB, db, rootpath)
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const {detailCustomer, objToken} = data

        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // create lock_transaction data
            await ltModel.insertLogin('Insert new customer, name ' + detailCustomer.customer_name + ', email ' + detailCustomer.customer_email + ', phone' + detailCustomer.customer_phone)

            // update column customer_id in auth_token
            let tokenData = {
                "customer_id": detailCustomer.customer_id,
                "updated_date": now
            }
            await authModel.updateToken(objToken.atoken_id, tokenData)

            //INSERT IGNORE HISTORY TOKEN
            let insData = {
                "atoken_device": objToken.atoken_device,
                "atoken_platform": objToken.atoken_platform,
                "created_date": now
            }
            await authModel.insertHistoryToken(insData)
            // update last login
            await fn.updateCustomer(detailCustomer.customer_id, {"last_login": now})

            //COMMIT
            await db.query('COMMIT')

            return true
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            return false//return false supaya muncul pesan error general auth022
        }
    }
    //END LOGIN
    return fn
}

module.exports = obj
