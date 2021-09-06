"use strict"

let obj = (rootpath) => {
    const moment = require('moment')
    const validator = require('validator')
    const fn = {}

    // START ACCOUNT
    fn.getAccount = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.params.account_number || ''
            if (validator.isEmpty(account_number)) {
                throw getMessage('udt001')
            }
            // validate if address exists
            let result = await req.model('account').getAccountByNumber(account_number)
            if (!result) {
                throw getMessage('udt004')
            }
            // validate if address belongs to loggedin customer using not found error message
            if (result.customer_id != customer_id) {
                throw getMessage('udt004')
            }

            res.success(result)
        } catch (e) {next(e)}
    }

    fn.getAllAccount = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            let keyword = req.query.keyword || ''
            keyword = '%' + keyword + '%'
            let where = ' AND customer_account_status = $1 AND customer_id = $2 AND (customer_account_name LIKE $3 OR customer_account_number LIKE $4) '
            let data = [true, customer_id, keyword, keyword]
            let order_by = ' customer_account_id ASC '
            let result = await req.model('account').getAllAccount(where, data, order_by)

            res.success(result)
        } catch(e) {next(e)}
    }

    fn.getPagingAccount = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            let keyword = req.query.keyword || ''
            keyword = '%' + keyword + '%'
            let where = ' AND customer_account_status = $1 AND customer_id = $2 AND (customer_account_name LIKE $3 OR customer_account_number LIKE $4) '
            let data = [true, customer_id, keyword, keyword]
            let order_by = ' customer_account_id ASC '
            let page_no = req.query.page || 0
            let no_per_page = req.query.perpage || 0
            let result = await req.model('account').getPagingAccount(
                where,
                data,
                order_by,
                page_no,
                no_per_page
            )

            res.success(result)
        } catch(e) {next(e)}
    }

    fn.createAccount = async (req, res, next) => {
        try {
            let validator = require('validator')
            let moment = require('moment')
            let now = moment().format('YYYY-MM-DD HH:mm:ss')

            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            // get parameter
            let name = (req.body.account_name || '').trim()
            let number = (req.body.account_number || '').trim()

            // Start Validate required
            if (validator.isEmpty(name)) {
                throw getMessage('udt001')
            }

            if (validator.isEmpty(number)) {
                throw getMessage('udt002')
            }

            // set variable to insert
            let data = {
                customer_id : customer_id,
                customer_account_name : name,
                customer_account_number : number,
                created_date : now
            }
            
            let customer_account;
            try {
                customer_account = await req.model('account').insertAccount(data)
            } catch (error) {
                if(error.constraint == 'customer_account_customer_account_number_key'){
                    throw getMessage('udt011')
                }

                throw getMessage('err001')
            }

            let result = await req.model('account').getAccount(customer_account.customer_account_id)
            res.success(result)   
        } catch(e) {next(e)}
    }

    fn.updateAccount = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.params.account_number || ''
            if (account_number <= 0) {
                throw getMessage('udt001')
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

            let data = {
                customer_account_name: (req.body.customer_account_name || account.customer_account_name).trim(),
                updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            await req.model('account').updateAccount(account.customer_account_id, data)
            let result = await req.model('account').getAccount(account.customer_account_id)
            res.success(result)
        } catch(e) {next(e)}
    }

    fn.topupAccount = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }
            let account_number = req.params.account_number || ''
            if (validator.isEmpty(account_number)) {
                throw getMessage('udt001')
            }
            let amount = parseInt(req.body.amount) || 0
            // validate if the amount is more than 10000
            if(amount <= 10000){
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

            let data = {
                to : account,
                from: account,
                amount: amount,
                type: 'topup'
            }

            let is_transacted = await req.model('account').accountTransaction(data)

            if(is_transacted.status){
                let result = await req.model('account').getAccount(account.customer_account_id)
                result.transaction_id = is_transacted.transaction_id
                res.success(result)
            }else{
                throw getMessage('udt013')
            }
        } catch(e) {next(e)}
    }

    fn.transfer = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }


            let account_number_from = req.params.from || ''
            let account_number_to = req.body.to_account_number || ''

            // validate account number from and to
            if(account_number_from == account_number_to){
                throw getMessage('udt014')
            }
            
            // from
            if (validator.isEmpty(account_number_from)) {
                throw getMessage('udt001')
            }
            // validate if account exists
            let account = await req.model('account').getAccountByNumber(account_number_from)
            if (!account) {
                throw getMessage('udt004')
            }
            // validate if account belongs to loggedin customer
            if (account.customer_id != customer_id) {
                throw getMessage('udt005')
            }
            // validate the amount
            let amount = parseInt(req.body.amount) || 0
            if (account.customer_account_balance <= amount) {
                throw getMessage('udt015') 
            }
            if (amount <= 10000) {
                throw getMessage('udt012') 
            }
            
            // to
            if (validator.isEmpty(account_number_to)) {
                throw getMessage('udt016')
            }
            // validate if account exists
            let account_to = await req.model('account').getAccountByNumber(account_number_to)
            if (!account_to) {
                throw getMessage('udt017')
            }
            
            let data = {
                to : account_to,
                from: account,
                amount: amount,
                type: 'transfer'
            }

            let is_transfered = await req.model('account').accountTransaction(data)

            if(is_transfered){
                res.success({}, 201)
            }else{
                throw getMessage('udt013')
            }
        } catch(e) {next(e)}
    }

    // END ACCOUNT

    return fn
}

module.exports = obj