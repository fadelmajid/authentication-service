"use strict";

let obj = (objDB, db, rootpath) => {
  const tbl = require(rootpath + "/config/tables.json");
  const fn = {};
  let moment = require("moment");
  let now = moment().format("YYYY-MM-DD HH:mm:ss");

  fn.insertTransaction = async (data) => {
    let res = await objDB.insert(db, tbl.transaction, data, "transaction_id");
    return res;
  };

  fn.updateTransaction = async (id, data) => {
    let where = { cond: "transaction_id = $1", bind: [id] };
    return await objDB.update(db, tbl.transaction, where, data);
  };

  fn.getTransaction = async (id) => {
    // prepare sql query
    let sql =
      "SELECT * FROM " +
      tbl.transaction +
      " WHERE transaction_id = $1 AND deleted_at IS NULL LIMIT 1";

    let rows = await db.query(sql, [id]);
    return rows.rows[0];
  };

  fn.getAllTransaction = async (
    where = "",
    data = [],
    order_by = " transaction_id ASC ",
    limit = 0
  ) => {
    let sql =
      "SELECT * FROM " +
      tbl.transaction +
      " WHERE 1=1 " +
      where +
      " ORDER BY " +
      order_by;

    let result = await objDB.getAll(db, sql, data, limit);
    return result;
  };

  fn.getPagingTransaction = async (
    where = "",
    data = [],
    order_by = " transaction_id ASC ",
    page_no = 0,
    no_per_page = 0
  ) => {
    let paging = loadLib("sanitize").pagingNumber(page_no, no_per_page);
    let sql =
      "SELECT transaction.* FROM " +
      tbl.transaction +
      " WHERE 1=1 " +
      where +
      " ORDER BY " +
      order_by;
    let result = await objDB.getPaging(
      db,
      sql,
      data,
      paging.page_no,
      paging.no_per_page
    );
    return result;
  };

  fn.softDeleteTransaction = async (id, data) => {
    let where = { cond: "transaction_id = $1", bind: [id] };
    return await objDB.update(db, tbl.transaction, where, { deleted_at: now });
  };

  fn.deleteTransaction = async (id) => {
    let where = { cond: "transaction_id = $1", bind: [id] };
    return await objDB.delete(db, tbl.transaction, where);
  };

  return fn;
};

module.exports = obj;
