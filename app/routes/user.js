'use strict'

module.exports = (app) => {
    const userController = app.controller('user')

    let aRoutes = [
        // START PROFILE
        {method: 'get', route: '/profile', inits: [], middlewares: [userController.getProfile], auth: 'login'},
        {method: 'put', route: '/profile', inits: [], middlewares: [userController.updateProfile], auth: 'login'},
        // END PROFILE
    ]
    return aRoutes
}
