'use strict'
let obj = (objDB, db, rootpath) => {
    const tbl = require(rootpath + '/config/tables.json')
    const cst = require(rootpath + '/config/const.json')
    const fn = {}

    // START VERSION
    fn.getActiveVersionCode = async (code, platform) => {
        let sql = "SELECT * FROM " + tbl.app_version + " WHERE ver_code = $1 AND ver_platform = $2 AND ver_status IN ($3,$4) LIMIT 1"
        let rows = await db.query(sql, [code, platform, cst.ver_active, cst.ver_unreleased])
        return rows.rows[0]
    }

    fn.getLastestVersion = async (platform) => {
        let sql = "SELECT * FROM " + tbl.app_version + " WHERE ver_platform = $1 AND ver_status = $2 ORDER BY created_date DESC, ver_code DESC LIMIT 1"
        let rows = await db.query(sql, [platform, cst.ver_active])
        return rows.rows[0]
    }
    // END VERSION
    return fn
}

module.exports = obj
