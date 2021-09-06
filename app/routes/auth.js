'use strict'

module.exports = (app) => {
    const authController = app.controller('auth')
    let aRoutes = [
        {method: 'get', route: '/get-token', inits: [], middlewares: [authController.getToken], auth: 'no'},
        {method: 'get', route: '/get-version', inits: [], middlewares: [authController.getVersion], auth: 'yes'},
        {method: 'post', route: '/login', inits: [], middlewares: [authController.login], auth: 'yes'},
        {method: 'post', route: '/register', inits: [], middlewares: [authController.register], auth: 'yes'},
        {method: 'get', route: '/refresh-token', inits: [], middlewares: [authController.refreshToken], auth: 'no'},
        {method: 'post', route: '/logout', inits: [], middlewares: [authController.logout], auth: 'login'}
    ]
    return aRoutes
}