'use strict'

let obj = (objDB, db, rootpath) => {

    let moment = require('moment')
    const crypto = require('crypto')
    const tbl = require(rootpath + "/config/tables.json")
    const config = require(rootpath + "/config/config.json")
    const validator = require('validator')
    const fn = {}

    // BEGIN AUTH TOKEN

    fn.verifySecretKey = async (secret_key) => secret_key === config.secret_key ? true : false
    
    fn.getValidAccessToken = async (access_token) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        // prepare sql query
        let sql = "SELECT * FROM " + tbl.auth_token + " WHERE atoken_access = $1 AND atoken_status = $2 AND expired_date > $3 LIMIT 1"

        let row = await db.query(sql, [access_token, 'active', now])
        return row.rows[0]
    }

    fn.getValidRefreshToken = async (refresh_token) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.auth_token + " WHERE atoken_refresh = $1 AND atoken_status = $2 LIMIT 1"

        let row = await db.query(sql, [refresh_token, 'active'])
        return row.rows[0]
    }

    fn.getCustomerToken = async (id) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.auth_token + " WHERE atoken_id = $1 LIMIT 1"
        let row = await db.query(sql, [id])
        return row.rows[0]
    }

    //get all auth token
    fn.getAllAuthToken = async (where = '', data = [], order_by = 'customer_id ASC', limit = 0) => {
        let sql = "SELECT * FROM " + tbl.auth_token + " WHERE 1=1 " + where + " ORDER BY " + order_by
        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }


    fn.getNewToken = async (atoken_id) => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        // generate & validate unik access token
        let access_token = fn.generateToken('access')

        // insert new token
        let data = {
            "atoken_access": access_token,
            "expired_date": moment().add(config.expire_token_hours, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            "updated_date": now
        }
        await fn.updateToken(atoken_id, data)

        // return 1 row of customer token
        return await fn.getCustomerToken(atoken_id)
    }

    fn.getToken = async (device_id, platform) => {
        // set existing token to inactive
        await fn.setTokenInactive(device_id)

        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        // generate & validate unik access token
        let access_token = fn.generateToken('access')

        // generate & validate unik refresh token
        let refresh_token = fn.generateToken('refresh')

        // insert new token
        let data = {
            "customer_id": "0",
            "atoken_device": device_id,
            "atoken_platform": platform,
            "atoken_access": access_token,
            "atoken_refresh": refresh_token,
            "atoken_status": "active",
            "expired_date": moment().add(config.expire_token_hours, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            "created_date": now
        }
        let atoken_id = await fn.insertToken(data)

        // return 1 row of customer token
        return await fn.getCustomerToken(atoken_id.atoken_id)
    }

    fn.setTokenInactive = async (device_id) => {
        // update existing token to inactive
        let where = {"cond": "atoken_device = $1 AND atoken_status = $2 ", "bind": [device_id, 'active']}
        let data = {
            "atoken_status": "inactive",
            "updated_date": moment().format('YYYY-MM-DD HH:mm:ss')
        }
        await objDB.update(db, tbl.auth_token, where, data)
    }

    fn.insertToken = async (data) => {
        let res = await objDB.insert(db, tbl.auth_token, data, "atoken_id")
        return res
    }

    fn.updateToken = async (id, data) => {
        let where = {"cond": "atoken_id = $1", "bind": [id]}
        return await objDB.update(db, tbl.auth_token, where, data)
    }

    fn.generateToken = (string) => {
        const mili = moment().millisecond()
        const rstr = '_' + Math.random().toString(36).substr(2, 9)
        return crypto.createHash('sha256').update(mili + string + rstr).digest("hex")
    }
    // END AUTH TOKEN

    // BEGIN HISTORY TOKEN
    fn.getHistoryToken = async (data) => {
        let sql = "SELECT * FROM " + tbl.history_device + " WHERE atoken_device = $1 AND atoken_platform = $2 LIMIT 1 "
        let [row] = await db.query(sql, [data.device_id, data.platform])
        return row
    }
    fn.insertHistoryToken = async (data) => {
        let sql = "INSERT INTO " + tbl.history_device + " (atoken_device,atoken_platform,created_date) VALUES ($1, $2, $3)";
        return await db.query(sql, [data.atoken_device, data.atoken_platform, data.created_date])
    }
    // END HISTORY TOKEN

    return fn
}

module.exports = obj
