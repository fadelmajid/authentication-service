'use strict'

module.exports = (app) => {
    const accountController = app.controller('account')

    let aRoutes = [
        // START ACCOUNT
        {method: 'post', route: '/', inits: [], middlewares: [accountController.createAccount], auth: 'login'},
        {method: 'get', route: '/all', inits: [], middlewares: [accountController.getAllAccount], auth: 'login'},
        {method: 'get', route: '/', inits: [], middlewares: [accountController.getPagingAccount], auth: 'login'},
        {method: 'put', route: '/:account_number', inits: [], middlewares: [accountController.updateAccount], auth: 'login'},
        {method: 'get', route: '/:account_number', inits: [], middlewares: [accountController.getAccount], auth: 'login'},
        // END ACCOUNT
    
        // START CRUD
        {method: 'put', route: '/:account_number/topup', inits: [], middlewares: [accountController.topupAccount], auth: 'login'},
        {method: 'post', route: '/:from/transfer', inits: [], middlewares: [accountController.transfer], auth: 'login'}
        // END CRUD
    ]
    return aRoutes
}
