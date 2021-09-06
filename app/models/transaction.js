'use strict'

let obj = (objDB, db, rootpath) => {
    const tbl = require(rootpath + "/config/tables.json")
    const fn = {}

    fn.insertTransaction = async (data) => {
        let res = await objDB.insert(db, tbl.customer_transaction, data, "customer_transaction_id")
        return res
    }

    fn.updateTransaction = async (id, data) => {
        let where = {'cond': 'customer_transaction_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer_transaction, where, data)
    }

    fn.getTransaction = async (id) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer_transaction + " WHERE customer_transaction_id = $1 LIMIT 1"

        let rows = await db.query(sql, [id])
        return rows.rows[0]
    }

    fn.getAllTransaction = async (where = '', data = [], order_by = " customer_transaction_id ASC ", limit = 0) => {
        let sql = "SELECT * FROM " + tbl.customer_transaction + " WHERE 1=1 " + where + " ORDER BY " + order_by

        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }

    fn.getPagingTransaction = async (where = '', data = [], order_by = " customer_transaction_id ASC ", page_no = 0, no_per_page = 0) => {
        let paging = loadLib('sanitize').pagingNumber(page_no, no_per_page)
        let sql = "SELECT customer_transaction.* FROM " + tbl.customer_transaction + " WHERE 1=1 " + where + " ORDER BY " + order_by
        let result = await objDB.getPaging(db, sql, data, paging.page_no, paging.no_per_page)
        return result
    }

    fn.deleteTransaction = async (id) => {
        let where = {"cond": "customer_transaction_id = $1", "bind": [id]}
        return await objDB.delete(db, tbl.customer_transaction, where)
    }

    return fn
}

module.exports = obj
