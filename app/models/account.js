'use strict'
let obj = (objDB, db, rootpath) => {
    const tbl = require(rootpath + '/config/tables.json')
    const fn = {}

    // START ACCOUNT
    fn.insertAccount = async (data) => {
        let res = await objDB.insert(db, tbl.customer_account, data, "customer_account_id")
        return res
    }

    fn.getAccount = async (id) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer_account + " WHERE customer_account_id = $1 LIMIT 1"

        let rows = await db.query(sql, [id])
        return rows.rows[0]
    }

    fn.getAccountByNumber = async (number) => {
        // prepare sql query
        let sql = "SELECT * FROM " + tbl.customer_account + " WHERE customer_account_number = $1 LIMIT 1"

        let rows = await db.query(sql, [number])
        return rows.rows[0]
    }

    fn.updateAccount = async (id, data) => {
        let where = {'cond': 'customer_account_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer_account, where, data)
    }

    fn.deleteSoftAccount = async (id, data) => {
        let where = {'cond': 'customer_account_id = $1', 'bind': [id]}
        return await objDB.update(db, tbl.customer_account, where, data)
    }

    fn.deleteAccount = async (id) => {
        let where = {"cond": "customer_account_id = $1", "bind": [id]}
        return await objDB.delete(db, tbl.customer_account, where)
    }

    fn.getAllAccount = async (where = '', data = [], order_by = " customer_account_id ASC ", limit = 0) => {
        let sql = "SELECT * FROM " + tbl.customer_account + " WHERE 1=1 " + where + " ORDER BY " + order_by

        let result = await objDB.getAll(db, sql, data, limit)
        return result
    }

    fn.getPagingAccount = async (where = '', data = [], order_by = " customer_account_id ASC ", page_no = 0, no_per_page = 0) => {
        let paging = loadLib('sanitize').pagingNumber(page_no, no_per_page)
        let sql = "SELECT customer_account.* FROM " + tbl.customer_account + " WHERE 1=1 " + where + " ORDER BY " + order_by
        let result = await objDB.getPaging(db, sql, data, paging.page_no, paging.no_per_page)
        return result
    }

    //BEGIN TRANSFER
    fn.accountTransaction = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const trxModel = require('./transaction.js')(objDB, db, rootpath)
        const {to, from, amount, type, notes} = data

        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // insert lock_transaction data
            await ltModel.insert(
                'Insert new transaction, '+ type +' from customer_account_id: ' 
                + to.customer_account_id + ', to customer_account_id: ' 
                + from.customer_account_id + ', amount :' + amount
            )

            // insert customer transaction data
            let trx_id = await trxModel.insertTransaction({
                customer_id_to: to.customer_id,
                customer_id_from: from.customer_id,
                customer_transaction_amount: amount,
                customer_transaction_type: type,
                customer_transaction_notes: notes,
                created_date: now
            })

            // update customer account balance // deduct balance sender
            if(type == 'transfer'){
                await fn.updateAccount(from.customer_account_id, {
                    customer_account_balance: from.customer_account_balance - amount,
                    updated_date: now
                })
            }

            // update customer account balance // add balance receiver
            await fn.updateAccount(to.customer_account_id, {
                customer_account_balance: to.customer_account_balance + amount,
                updated_date: now
            })

            //COMMIT
            await db.query('COMMIT')

            return {
                status: true,
                transaction_id: trx_id
            }
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            return {
                status: false
            }
        }
    }

    fn.createAccountTransaction = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const trxModel = require('./transaction.js')(objDB, db, rootpath)
        const {to, from, amount, type, notes} = data

        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // insert lock_transaction data
            await ltModel.insert(
                'Insert new transaction, '+ type +' from customer_account_id: ' 
                + to.customer_account_id + ', to customer_account_id: ' 
                + from.customer_account_id + ', amount :' + amount
            )

            // insert customer transaction data
            let trx_id = await trxModel.insertTransaction({
                customer_id_to: to.customer_id,
                customer_id_from: from.customer_id,
                customer_transaction_amount: amount,
                customer_transaction_type: type,
                customer_transaction_notes: notes,
                created_date: now
            })

            // update customer account balance // deduct balance sender
            if(type == 'expense'){
                await fn.updateAccount(from.customer_account_id, {
                    customer_account_balance: from.customer_account_balance - amount,
                    updated_date: now
                })
            }else{
                await fn.updateAccount(from.customer_account_id, {
                    customer_account_balance: from.customer_account_balance + amount,
                    updated_date: now
                })
            }

            //COMMIT
            await db.query('COMMIT')

            return {
                status: true,
                transaction_id: trx_id
            }
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            return {
                status: false
            }
        }
    }

    fn.updateAccountTransaction = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const trxModel = require('./transaction.js')(objDB, db, rootpath)
        const {trx, to, from, amount, type, notes} = data

        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // insert lock_transaction data
            await ltModel.insert(
                'Update transaction, '+ type +' from customer_account_id: ' 
                + to.customer_account_id + ', to customer_account_id: ' 
                + from.customer_account_id + ', amount :' + amount
            )

            // validate old transaction type
            if(trx.customer_transaction_type == 'expense'){
                // depend on new transaction type
                // update customer account balance // deduct balance
                if(type == 'expense'){
                    await fn.updateAccount(from.customer_account_id, {
                        customer_account_balance: from.customer_account_balance + trx.customer_transaction_amount - amount,
                        updated_date: now
                    })
                }else{
                    // depend on new transaction type
                    // update customer account balance // add balance
                    await fn.updateAccount(from.customer_account_id, {
                        customer_account_balance: from.customer_account_balance + trx.customer_transaction_amount + amount,
                        updated_date: now
                    })
                }
            }else{
                // update customer account balance // deduct balance
                if(type == 'expense'){
                    await fn.updateAccount(from.customer_account_id, {
                        customer_account_balance: from.customer_account_balance - trx.customer_transaction_amount - amount,
                        updated_date: now
                    })
                }else{
                    // update customer account balance // add balance
                    await fn.updateAccount(from.customer_account_id, {
                        customer_account_balance: from.customer_account_balance - trx.customer_transaction_amount + amount,
                        updated_date: now
                    })
                }
            }

            // update customer transaction data
            await trxModel.updateTransaction(trx.customer_transaction_id, {
                customer_id_to: from.customer_id,
                customer_id_from: from.customer_id,
                customer_transaction_amount: amount,
                customer_transaction_type: type,
                customer_transaction_notes: notes,
                updated_date: now
            })

            //COMMIT
            await db.query('COMMIT')

            return {
                status: true,
                transaction_id: trx.customer_transaction_id
            }
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            return {
                status: false
            }
        }
    }


    fn.deleteAccountTransaction = async (data) => {
        let moment = require('moment')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const ltModel = require('./lock_transaction.js')(objDB, db, rootpath)
        const trxModel = require('./transaction.js')(objDB, db, rootpath)
        const {trx, to, from, amount, type} = data

        //BEGIN TRANSACTION
        await db.query('BEGIN')
        try{
            // insert lock_transaction data
            await ltModel.insert(
                'Delete transaction, '+ type +' from customer_account_id: ' 
                + to.customer_account_id + ', to customer_account_id: ' 
                + from.customer_account_id + ', amount :' + amount
            )

            // update customer account balance // deduct balance
            if(type == 'expense'){
                await fn.updateAccount(from.customer_account_id, {
                    customer_account_balance: from.customer_account_balance + trx.customer_transaction_amount,
                    updated_date: now
                })
            }else{
                // update customer account balance // add balance
                await fn.updateAccount(from.customer_account_id, {
                    customer_account_balance: from.customer_account_balance - trx.customer_transaction_amount,
                    updated_date: now
                })
            }

            // delete customer transaction data
            await trxModel.deleteTransaction(trx.customer_transaction_id)
            
            //COMMIT
            await db.query('COMMIT')

            return {
                status: true
            }
        }catch(e) {
            //ROLLBACK
            await db.query('ROLLBACK')
            return {
                status: false
            }
        }
    }
    // END ACCOUNT
    return fn
}

module.exports = obj
