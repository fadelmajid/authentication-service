"use strict";

let obj = (rootpath) => {
  const moment = require("moment");
  let now = moment().format("YYYY-MM-DD HH:mm:ss");
  const validator = require("validator");
  const cst = require(rootpath + "/config/const.json");
  const fn = {};

  // START TRANSACTION
  fn.getTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }
      let transaction_id = req.params.transaction_id || 0;
      if (transaction_id <= 0) {
        throw getMessage("udt001");
      }

      // validate if address exists
      let result = await req
        .model("transaction")
        .getTransaction(transaction_id);
      if (!result) {
        throw getMessage("udt004");
      }

      // validate if address belongs to loggedin user using not found error message
      if (result.user_id != user_id) {
        throw getMessage("udt018");
      }

      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.getAllTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }

      // filter
      let payment_method = "";
      if (cst.trx_types.includes(req.query.payment_method)) {
        payment_method = req.query.payment_method;
      }
      let amount_from = req.query.from || 0;
      let amount_to = req.query.to || 2147483647;

      // order
      let order = req.query.order || "created_at";
      let sort = req.query.sort || "DESC";

      let arr_order = order.split(",");
      let arr_sort = sort.split(",");

      let order_by = "";
      for (let i = 0; i < arr_order.length; i++) {
        if (
          ["transaction_ total_amount", "created_at"].includes(arr_order[i])
        ) {
          if (!arr_sort[i]) {
            arr_sort[i] = "DESC";
          }
          order_by += ` ${arr_order[i]} ${arr_sort[i]},`;
        }
      }
      // removing last character in order by ','
      let new_order_by = order_by.slice(0, -1);

      let where =
        " AND user_id = $1 AND transaction_total_amount >= $2 AND transaction_total_amount <= $3 AND deleted_at IS NULL";
      let data = [user_id, amount_from, amount_to];

      if (!validator.isEmpty(payment_method)) {
        where += " AND transaction_payment_method = $4";
        data.push(payment_method);
      }

      let result = await req
        .model("transaction")
        .getAllTransaction(where, data, new_order_by);

      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.getPagingTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }

      // filter
      let payment_method = "";
      if (cst.trx_types.includes(req.query.payment_method)) {
        payment_method = req.query.payment_method;
      }
      let amount_from = req.query.from || 0;
      let amount_to = req.query.to || 2147483647; // max value integer in postgres

      // order
      let order = req.query.order || "created_at";
      let sort = req.query.sort || "DESC";

      let arr_order = order.split(",");
      let arr_sort = sort.split(",");

      let order_by = "";
      for (let i = 0; i < arr_order.length; i++) {
        if (["transaction_total_amount", "created_at"].includes(arr_order[i])) {
          if (!arr_sort[i]) {
            arr_sort[i] = "DESC";
          }
          order_by += ` ${arr_order[i]} ${arr_sort[i]},`;
        }
      }
      // removing last character in order by ','
      let new_order_by = order_by.slice(0, -1);
      let where =
        " AND user_id = $1 AND transaction_total_amount >= $2 AND transaction_total_amount <= $3 AND deleted_at IS NULL";
      let data = [user_id, amount_from, amount_to];

      if (!validator.isEmpty(payment_method)) {
        where += " AND transaction_payment_method = $4";
        data.push(payment_method);
      }

      let page_no = req.query.page || 0;
      let no_per_page = req.query.perpage || 0;
      let result = await req
        .model("transaction")
        .getPagingTransaction(where, data, new_order_by, page_no, no_per_page);

      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.createTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }
      // validate if the amount is more than 10000
      let total_amount = parseInt(req.body.total_amount) || 0;
      if (total_amount < 0) {
        throw getMessage("udt012");
      }

      let paid_amount = parseInt(req.body.paid_amount) || 0;
      if (paid_amount < 0) {
        throw getMessage("udt012");
      }

      // validate payemnt_method
      if (!cst.trx_types.includes(req.body.payment_method)) {
        throw getMessage("udt019");
      }

      let data = {
        user_id: user_id,
        transaction_total_amount: total_amount,
        transaction_paid_amount: paid_amount,
        transaction_change_amount: Math.abs(total_amount - paid_amount),
        transaction_payment_method: req.body.payment_method,
        created_at: now,
      };

      let transaction = await req.model("transaction").insertTransaction(data);
      let result = await req
        .model("transaction")
        .getTransaction(transaction.transaction_id);
      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.updateTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }
      // validate if the amount is more than 10000
      let total_amount = parseInt(req.body.total_amount) || 0;
      if (total_amount < 0) {
        throw getMessage("udt012");
      }

      let paid_amount = parseInt(req.body.paid_amount) || 0;
      if (paid_amount < 0) {
        throw getMessage("udt012");
      }

      // validate payemnt_method
      if (!cst.trx_types.includes(req.body.payment_method)) {
        throw getMessage("udt019");
      }

      // validate if transaction exists and transaction belongs to login user
      let trx = await req
        .model("transaction")
        .getTransaction(req.params.transaction_id);
      if (!trx) {
        throw getMessage("udt021");
      }

      if (trx.user_id !== user_id) {
        throw getMessage("udt005");
      }

      // validate payment_method of transaction
      if (!cst.trx_types.includes(req.body.payment_method)) {
        throw getMessage("udt019");
      }

      let data = {
        user_id: user_id,
        transaction_total_amount: total_amount || trx.transaction_total_amount,
        transaction_paid_amount: paid_amount || trx.transaction_paid_amount,
        transaction_change_amount:
          Math.abs(total_amount - paid_amount) || trx.transaction_change_amount,
        transaction_payment_method:
          req.body.payment_method || trx.transaction_payment_method,
        updated_at: now,
      };

      await req
        .model("transaction")
        .updateTransaction(trx.transaction_id, data);

      let result = await req
        .model("transaction")
        .getTransaction(trx.transaction_id);

      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.deleteTransaction = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }

      // validate if transaction exists and transaction belongs to login user
      let trx = await req
        .model("transaction")
        .getTransaction(req.params.transaction_id);
      if (!trx) {
        throw getMessage("udt021");
      }

      if (trx.user_id !== user_id) {
        throw getMessage("udt006");
      }

      let is_transacted = await req
        .model("transaction")
        .softDeleteTransaction(req.params.transaction_id);

      if (is_transacted) {
        res.success({
          message: `transaction ${req.params.transaction_id} has been deleted`,
        });
      } else {
        throw getMessage("udt013");
      }
    } catch (e) {
      next(e);
    }
  };

  // END TRANSACTION

  return fn;
};

module.exports = obj;
