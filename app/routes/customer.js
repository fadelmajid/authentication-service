'use strict'

module.exports = (app) => {
    const customerController = app.controller('customer')

    let aRoutes = [
        // START PROFILE
        {method: 'get', route: '/profile', inits: [], middlewares: [customerController.getProfile], auth: 'login'},
        {method: 'put', route: '/profile', inits: [], middlewares: [customerController.updateProfile], auth: 'login'},
        // END PROFILE
    ]
    return aRoutes
}
