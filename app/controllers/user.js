"use strict";
let obj = (rootpath) => {
  const moment = require("moment");
  const fn = {};

  // BEGIN PROFILE
  fn.getProfile = async (req, res, next) => {
    try {
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }

      let result = await req.model("user").getUser(user_id);
      if (isEmpty(result)) {
        throw getMessage("cst007");
      }

      // don't show the password when get profile
      delete result.customer_password;

      res.success(result);
    } catch (e) {
      next(e);
    }
  };

  fn.updateProfile = async (req, res, next) => {
    try {
      let validator = require("validator");
      let user_id = parseInt(req.objUser.user_id) || 0;
      if (user_id <= 0) {
        throw getMessage("cst006");
      }

      // Validate customername length
      let name = (req.body.customer_name || "").trim();
      let email = (req.body.email || "").trim().toLowerCase();
      let phone = (req.body.phone || "").trim();
      let id_number = (req.body.id_number || "").trim();

      if (!loadLib("validation").validName(name)) {
        throw getMessage("cst018");
      }

      let detailUser = await req.model("user").getUser(user_id);
      if (isEmpty(detailUser)) {
        throw getMessage("cst007");
      }

      let data = {
        customer_name: name || detailUser.customer_name,
        customer_email: email || detailUser.customer_email,
        customer_phone: phone || detailUser.customer_phone,
        user_identification_id: id_number || detailUser.user_identification_id,
        updated_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      // validate name
      if (validator.isEmpty(data.customer_name)) {
        throw getMessage("cst002");
      }
      // validate email
      if (validator.isEmpty(data.customer_email)) {
        throw getMessage("cst003");
      }
      // validate email format
      if (!loadLib("validation").isValidEmail(data.customer_email)) {
        throw getMessage("cst004");
      }
      // validate if email exists and not belong to logged in customer
      let dupEmail = await req
        .model("customer")
        .getUserEmail(data.customer_email);
      if (dupEmail && dupEmail.user_id !== user_id) {
        throw getMessage("cst005");
      }

      // insert data & get detail
      await req.model("user").updateUser(user_id, data);
      let result = await req.model("user").getUser(user_id);

      // don't show password
      delete result.customer_password;

      res.success(result);
    } catch (e) {
      next(e);
    }
  };
  // END PROFILE
  return fn;
};

module.exports = obj;
