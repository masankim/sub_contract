var express = require("express");
var router = express.Router();
var cors = require('cors');
var mysql = require('mysql2')

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'subcontract'
})

module.exports = function () {
  router.get("/", function (req, res, next) {
    res.render("index/login");
  });

  router.route("/signup").get(function (req, res, next) {
    res.render("index/signUp");
  });

  router.route("/confirm_email").get(function (req, res, next) {
    //email 인증 번호
  });

  router.route("/create_id").post(function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const company_num = req.body.company_num;
    const company_name = req.body.company_name;
    const manager_name = req.body.person_name;
    const company_phone = req.body.phone;
    const company_address = req.body.company_address;
    connection.query(
      `SELECT email from user where email = ?`,
      [email],
      function(err, result){
          if(err){
              console.log(err);
              res.render('index/signUp', {errorMessage:"다시 한번 시도해주시기 바랍니다."});
          }else if (result.length > 0){
              console.log("result 존재");
              res.render('index/signUp', {errorMessage:"이미 존재하는 ID입니다."})
          }else { 
            connection.query(
              `insert into user (email, password, company_num, company_name, manager_name, company_phone, company_add) 
              values (?,?,?,?,?,?,?)`,
              [email, password, company_num, company_name, manager_name, company_phone, company_address],
              function(err, result){
                  if (err){
                      console.log(err);
                      res.render('index/signup', {errorMessage: "다시 한번 시도해주시기 바랍니다."})
                  }else{
                      res.redirect("/");
                  }
              }
            )
          }
      }
    )
  });

  router.route("/find_id").get(function (req, res, next) {
    res.render("index/findId");
  });

  router.route("/search_id").post(function (req, res, next) {
    const company_num = req.body.company_num;
    console.log("company_num = ", company_num);
    res.redirect("/");
  });

  router.route("/find_pass").get(function (req, res, next) {
    res.render("index/findPw");
  });

  router.route("/search_pass").post(function (req, res, next) {
    const company_num = req.body.company_num;
    const email = req.body.email;
    console.log("company_num = ", company_num, "email = ", email);
    res.redirect("/");
  });

  router.route("/main").post(function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    connection.query(
      `select * from user where email = ? and password = ?`,
      [email, password],
      function(err, result){
          if(err){
              console.log(err);
              res.redirect("/");
          }else if(result.length > 0){
              req.session.email = email;
              req.session.password = password;
              req.session.company_name = result[0].company_name;
              const company_name = result[0].company_name;
              const manager_name = result[0].manager_name;
              res.render("index/main", {manager : manager_name, company : company_name});
          }else {
              res.redirect("/");
          }
      }
    ) 
  });

  return router;
};
