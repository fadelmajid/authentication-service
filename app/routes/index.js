'use strict';

module.exports = (app, router) => {
    const mainController = app.controller('main');
    const authController = app.controller('auth');

    router.use('/auth', app.route('auth', authController));
    router.use('/customer', app.route('customer', authController));
    router.use('/account', app.route('account', authController));
    router.use('/transaction', app.route('transaction', authController));
    router.get('/', mainController.index);
};
