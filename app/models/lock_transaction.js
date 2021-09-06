'use strict'

let obj = (objDB, db, rootpath) => {

    const tbl = require(rootpath + "/config/tables.json")
    const fn = {}

    fn.insert = async (lock_remarks) => {
        const moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        let sql =
            "INSERT INTO " + tbl.lock_transaction +
            " (lock_id, lock_remarks, updated_date) VALUES (3, $1, $2) " +
            " ON CONFLICT (lock_id) DO UPDATE SET lock_remarks = $3, updated_date = $4";

        let result = await db.query(sql, [lock_remarks, now, lock_remarks, now])
        return result
    }

    fn.insertRegister = async (lock_remarks) => {
        const moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        let sql =
            "INSERT INTO " + tbl.lock_transaction +
            " (lock_id, lock_remarks, updated_date) VALUES (3, $1, $2) " +
            " ON CONFLICT (lock_id) DO UPDATE SET lock_remarks = $3, updated_date = $4";

        let result = await db.query(sql, [lock_remarks, now, lock_remarks, now])
        return result    
    }

    fn.insertLogin = async (lock_remarks) => {
        const moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        let sql =
            "INSERT INTO " + tbl.lock_transaction +
            " (lock_id, lock_remarks, updated_date) VALUES (3, $1, $2) " +
            " ON CONFLICT (lock_id) DO UPDATE SET lock_remarks = $3, updated_date = $4";

        let result = await db.query(sql, [lock_remarks, now, lock_remarks, now])
        return result
    }


    return fn
}

module.exports = obj
