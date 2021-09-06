"use strict"

let obj = (rootpath) => {
    const moment = require('moment')
    const validator = require('validator')
    const cst = require(rootpath + '/config/const.json')
    const fn = {}

    // START TRANSACTION
    fn.getTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let transaction_id = req.params.transaction_id || 0
            if (transaction_id <= 0) {
                throw getMessage('udt001')
            }
            // validate if address exists
            let result = await req.model('transaction').getTransaction(transaction_id)
            if (!result) {
                throw getMessage('udt004')
            }

            // validate if address belongs to loggedin customer using not found error message
            if (result.customer_id_from != customer_id || result.customer_id_to != customer_id) {
                throw getMessage('udt018')
            }

            res.success(result)
        } catch (e) {next(e)}
    }

    fn.getAllTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            // filter 
            let type = ''
            if(cst.trx_types.includes(req.query.type)){
                type = req.query.type
            }
            let amount_from = req.query.from || 0 
            let amount_to = req.query.to || 2147483647

            // order
            let order = req.query.order || 'created_date'
            let sort = req.query.sort || 'DESC'

            let arr_order = order.split(',')
            let arr_sort = sort.split(',')

            let order_by = ''
            for(let i = 0; i < arr_order.length; i++){
                if(['customer_transaction_amount', 'created_date'].includes(arr_order[i])){
                    if(!arr_sort[i]){
                        arr_sort[i] = 'DESC'
                    }
                    order_by += ` ${arr_order[i]} ${arr_sort[i]},`
                }
            }
            // removing last character in order by ','
            let new_order_by = order_by.slice(0, -1)

            let where = ' AND (customer_id_from = $1 OR customer_id_to = $2) AND customer_transaction_amount >= $3 AND customer_transaction_amount <= $4'
            let data = [customer_id, customer_id, amount_from, amount_to]

            if(!validator.isEmpty(type)){
                where += ' AND customer_transaction_type = $5'
                data.push(type)
            }

            let result = await req.model('transaction').getAllTransaction(where, data, new_order_by)

            res.success(result)
        } catch(e) {next(e)}
    }

    fn.getPagingTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            // filter 
            let type = ''
            if(cst.trx_types.includes(req.query.type)){
                type = req.query.type
            }
            let amount_from = req.query.from || 0 
            let amount_to = req.query.to || 2147483647 // max value integer in postgres

            // order
            let order = req.query.order || 'created_date'
            let sort = req.query.sort || 'DESC'

            let arr_order = order.split(',')
            let arr_sort = sort.split(',')

            let order_by = ''
            for(let i = 0; i < arr_order.length; i++){
                if(['customer_transaction_amount', 'created_date'].includes(arr_order[i])){
                    if(!arr_sort[i]){
                        arr_sort[i] = 'DESC'
                    }
                    order_by += ` ${arr_order[i]} ${arr_sort[i]},`
                }
            }
            // removing last character in order by ','
            let new_order_by = order_by.slice(0, -1)
            let where = ' AND (customer_id_from = $1 OR customer_id_to = $2) AND customer_transaction_amount >= $3 AND customer_transaction_amount <= $4'
            let data = [customer_id, customer_id, amount_from, amount_to]

            if(!validator.isEmpty(type)){
                where += ' AND customer_transaction_type = $5'
                data.push(type)
            }
            
            let page_no = req.query.page || 0
            let no_per_page = req.query.perpage || 0
            let result = await req.model('transaction').getPagingTransaction(
                where,
                data,
                new_order_by,
                page_no,
                no_per_page
            )

            res.success(result)
        } catch(e) {next(e)}
    }

    fn.createTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.body.account_number || ''
            if (validator.isEmpty(account_number)) {
                throw getMessage('udt001')
            }
            // validate if the amount is more than 10000
            let amount = parseInt(req.body.amount) || 0
            if(amount < 0){
                throw getMessage('udt012') 
            }
            // validate if account exists
            let account = await req.model('account').getAccountByNumber(account_number)
            if (!account) {
                throw getMessage('udt004')
            }
            // validate if account belongs to loggedin customer
            if (account.customer_id != customer_id) {
                throw getMessage('udt005')
            }            
            // validate type of transaction
            if(!cst.trx_types.includes(req.body.type)){
                throw getMessage('udt019')
            }
            // validate existing transaction type
            if(req.body.type == 'transfer' && req.body.type == 'topup'){
                throw getMessage('udt020')
            }

            let notes = (req.body.notes || '').trim()

            let data = {
                to : account,
                from: account,
                amount: amount,
                type: req.body.type,
                notes: notes
            }

            let is_transacted = await req.model('account').createAccountTransaction(data)

            if(is_transacted.status){
                let result = await req.model('account').getAccount(account.customer_account_id)
                result.transaction_id = is_transacted.transaction_id
                res.success(result)
            }else{
                throw getMessage('udt013')
            }
        } catch(e) {next(e)}
    }

    fn.updateTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.body.account_number || ''
            if (validator.isEmpty(account_number)) {
                throw getMessage('udt001')
            }
            // validate if the amount is more than 10000
            let amount = parseInt(req.body.amount) || 0
            if(amount < 0){
                throw getMessage('udt012') 
            }
            // validate if account exists
            let account = await req.model('account').getAccountByNumber(account_number)
            if (!account) {
                throw getMessage('udt004')
            }
            // validate if account belongs to loggedin customer
            if (account.customer_id != customer_id) {
                throw getMessage('udt005')
            }
            
            // validate if transaction exists and transaction belongs to login customer
            let trx = await req.model('transaction').getTransaction(req.params.transaction_id)
            if(!trx){
                throw getMessage('udt021')
            }

            if(trx.customer_id_from !== customer_id && trx.customer_id_to !== customer_id){
                throw getMessage('udt005')
            }

            // validate type of transaction
            if(!cst.trx_types.includes(req.body.type)){
                throw getMessage('udt019')
            }

            // validate existing transaction type
            if(trx.customer_transaction_type == 'transfer' && trx.customer_transaction_type == 'topup'){
                throw getMessage('udt022')
            }

            // validate type of transaction
            if(req.body.type == 'transfer' || req.body.type == 'topup'){
                throw getMessage('udt023')
            }

            let notes = (req.body.notes || '').trim()

            let data = {
                trx: trx,
                to : account,
                from: account,
                amount: amount,
                type: req.body.type,
                notes: notes
            }

            let is_transacted = await req.model('account').updateAccountTransaction(data)

            if(is_transacted.status){
                let result = await req.model('account').getAccount(account.customer_account_id)
                result.transaction_id = is_transacted.transaction_id
                res.success(result)
            }else{
                throw getMessage('udt013')
            }
        } catch(e) {next(e)}
    }


    fn.deleteTransaction = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.body.account_number || ''
            if (validator.isEmpty(account_number)) {
                throw getMessage('udt001')
            }
            // validate if account exists
            let account = await req.model('account').getAccountByNumber(account_number)
            if (!account) {
                throw getMessage('udt004')
            }
            // validate if account belongs to loggedin customer
            if (account.customer_id != customer_id) {
                throw getMessage('udt006')
            }
            
            // validate if transaction exists and transaction belongs to login customer
            let trx = await req.model('transaction').getTransaction(req.params.transaction_id)
            if(!trx){
                throw getMessage('udt021')
            }

            if(trx.customer_id_from !== customer_id && trx.customer_id_to !== customer_id){
                throw getMessage('udt006')
            }
            
            // validate existing transaction type
            if(trx.customer_transaction_type == 'transfer' && trx.customer_transaction_type == 'topup'){
                throw getMessage('udt022')
            }

            let data = {
                trx : trx,
                to : account,
                from: account,
                amount: trx.customer_transaction_amount,
                type: trx.customer_transaction_type,
            }

            let is_transacted = await req.model('account').deleteAccountTransaction(data)

            if(is_transacted.status){
                res.success({
                    message: `transaction ${req.params.transaction_id} has been deleted`
                })
            }else{
                throw getMessage('udt013')
            }
        } catch(e) {next(e)}
    }

    // END TRANSACTION

    return fn
}

module.exports = obj