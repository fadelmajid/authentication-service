'use strict';

module.exports = (app, router) => {
    const mainController = app.controller('main');
    const authController = app.controller('auth');

    router.use('/auth', app.route('auth', authController));
    router.use('/user', app.route('user', authController));
    router.get('/', mainController.index);
};
