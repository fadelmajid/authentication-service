'use strict'

module.exports = (app) => {
    const trxController = app.controller('transaction')

    let aRoutes = [
        // START CRUD
        {method: 'post', route: '/', inits: [], middlewares: [trxController.createTransaction], auth: 'login'},
        {method: 'put', route: '/:transaction_id', inits: [], middlewares: [trxController.updateTransaction], auth: 'login'},
        {method: 'delete', route: '/:transaction_id', inits: [], middlewares: [trxController.deleteTransaction], auth: 'login'},
        {method: 'get', route: '/all', inits: [], middlewares: [trxController.getAllTransaction], auth: 'login'},
        {method: 'get', route: '/', inits: [], middlewares: [trxController.getPagingTransaction], auth: 'login'},
        {method: 'get', route: '/:transaction_id', inits: [], middlewares: [trxController.getTransaction], auth: 'login'},

        // {method: 'delete', route: '/:transaction_id', inits: [], middlewares: [trxController.softDeleteTransaction], auth: 'login'}
        // // END CRUD
    ]
    return aRoutes
}
