"use strict"
let obj = (rootpath) => {
    const moment = require('moment')
    const fn = {}

    // BEGIN PROFILE
    fn.getProfile = async (req, res, next) => {
        try {
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }

            let result = await req.model('customer').getCustomer(customer_id)
            if (isEmpty(result)) {
                throw getMessage('cst007')
            }

            // don't show the password when get profile
            delete result.customer_password

            res.success(result)
        } catch(e) {next(e)}
    }

    fn.updateProfile = async (req, res, next) => {
        try {
            let validator = require('validator')
            let customer_id = parseInt(req.objCustomer.customer_id) || 0
            if (customer_id <= 0) {
                throw getMessage('cst006')
            }


            // Validate customername length
            let name = (req.body.customer_name || '').trim()
            let email = (req.body.email || '').trim().toLowerCase()
            let phone = (req.body.phone || '').trim()            
            let id_number = (req.body.id_number || '').trim()    

            if (!loadLib('validation').validName(name)) {
                throw getMessage('cst018')
            }

            let detailCustomer = await req.model('customer').getCustomer(customer_id)
            if (isEmpty(detailCustomer)) {
                throw getMessage('cst007')
            }

            let data = {
                customer_name: name || detailCustomer.customer_name,
                customer_email: email || detailCustomer.customer_email,
                customer_phone: phone || detailCustomer.customer_phone,
                customer_identification_id: id_number || detailCustomer.customer_identification_id,
                updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }

            // validate name
            if (validator.isEmpty(data.customer_name)) {
                throw getMessage('cst002')
            }
            // validate email
            if (validator.isEmpty(data.customer_email)) {
                throw getMessage('cst003')
            }
            // validate email format
            if (!loadLib('validation').isValidEmail(data.customer_email)) {
                throw getMessage('cst004')
            }
            // validate if email exists and not belong to logged in customer
            let dupEmail = await req.model('customer').getCustomerEmail(data.customer_email)
            if (dupEmail && dupEmail.customer_id !== customer_id) {
                throw getMessage('cst005')
            }

            // insert data & get detail
            await req.model('customer').updateCustomer(customer_id, data)
            let result = await req.model('customer').getCustomer(customer_id)

            // don't show password
            delete result.customer_password

            res.success(result)
        } catch(e) {next(e)}
    }
    // END PROFILE
    return fn
}

module.exports = obj