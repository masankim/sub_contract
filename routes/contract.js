var express = require("express");
var router = express.Router();
var Web3 = require("web3");
var product_contract = require("../build/contracts/Subcontract.json");

var mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'subcontract'
})


var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
var smartcontract = new web3.eth.Contract(
  product_contract.abi,
  product_contract.networks['5777'].address
);

module.exports = function () {
  router.get("/", function (req, res, next) {
    res.render("contract/contract");
  });

  router.route("/detail").post(function (req, res, next) {
    const a = req.body.a;
    const b = req.body.b;
    const c = req.body.c;
    const d = req.body.d;
    const e = req.body.e;
    const f = req.body.f;
    const g = req.body.g;
    const h = req.body.h;
    const i = req.body.i;
    const j = req.body.j;
    const k = req.body.k;
    const l = req.body.l;
    const contract_info = a + "," + b + "," + c + "," + d + "," + e + "," + f + "," + g + "," + h + "," + i + "," + j + "," + k;
    // console.log(contract_info);
    res.render("contract/contract2", { contract_info: contract_info , hado : l});
  });

  router.route("/confirm").post(function (req, res, next) {
    const a = req.body.a;
    const b = req.body.b;
    const c = req.body.c;
    const d = req.body.d;
    const e = req.body.e;
    const f = req.body.f;
    const g = req.body.g;
    const h = req.body.h;
    const i = req.body.i;
    const l = req.body.hado;
    const contract_info = a + "," + b + "," + c + "," + d + "," + e + "," + f + "," + g + "," + h + "," + i;
    const contract_info2 = contract_info.split(',');
    // console.log(contract_info);
    res.render("contract/send_contract", {contract_info: contract_info2, hado: l});
  });

  router.route("/send").post(function (req, res, next) {
    const a = req.body.a;
    const b_company = req.body.hado;
    const contract_info2 = a.split(",");
    var a_company = req.session.company_name;
    const contract_num = contract_info2[0];
    const total_cost = contract_info2[8];
    // console.log(a_company);
    // console.log(contract_num);
    // console.log(a);
    // console.log(total_cost);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .enroll_contract(contract_num, a, total_cost)
      .send({
        from: ass[0],
        gas: 200000,
      })
      .then(function (receipt) {

        connection.query(
          `SELECT contract_num from contract where contract_num = ?`,
          [contract_num],
          function(err, result){
              if(err){
                  console.log(err);
              }else if (result.length > 0){
                  console.log("result 존재");
              }else { 
                connection.query(
                  `insert into contract (contract_num, a_company, b_company) 
                  values (?,?,?)`,
                  [contract_num, a_company, b_company],
                  function(err, result){
                      if (err){
                          console.log(err);
                      }else{
                        console.log(receipt);
                        res.redirect("/contract/list");
                      }
                  }
                )
              }
          }
        )

      });
    })
  });

  // router.route("/modify").post(function (req, res, next) {
  //   res.render("contract/modify_contract");
  // });

  // router.route("/confirm_h").get(function (req, res, next) {
  //   res.render("contract/confirm_contract_h");
  // });

  // router.route("/company").get(function (req, res, next) {
  //   res.render("contract/company_list");
  // });

  // router.route("/company_h").get(function (req, res, next) {
  //   res.render("contract/company_list_h");
  // });

  router.route("/list").get(function (req, res, next) {
    console.log("list ")
    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }
      // console.log(ass[0]);
      connection.query(
        `select count(*) as cnt from contract`,
        function(err, result){
          if(err){
            console.log(err)
          }else{
            const count = result[0].cnt;
            console.log(count);
            connection.query(
              `select contract_num from contract`,
              function(err, result2){
                if(err){
                  console.log(err)
                }else{
                  var contract_list = new Array();
                  var contract_state = new Array();
                  for(var i =0; i < count; i++){
                    console.log(result2[i].contract_num);
                    smartcontract.methods
                    .view_contract(result2[i].contract_num)
                    .call()
                    .then(function (receipt) {
                      console.log(receipt[0]);
                      console.log(receipt[1]);
                      const contract_info = receipt[0].split(",");
                      contract_list.push(contract_info);
                      contract_state.push(receipt[1]);
                    });
                  }
                  setTimeout(() => {
                    // console.log(contract_list);
                    res.render("contract/contract_list", {contract_info : contract_list, contract_state : contract_state})
                    // res.json({contract_info : contract_list, contract_state : contract_state})

                  }, 2000);
                }
              }
            )
          }
        }
      )    
    })
  });
  router.route("/sign").get(function (req, res, next) {
    const contract_num = req.query.contract_num;
    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .view_contract(contract_num)
      .call()
      .then(function (receipt) {
        console.log(receipt[0]);
        res.render("contract/sign_contract", {contract_info : receipt[0].split(",")});
      });
    })
  });

  router.route("/sign2").post(function (req, res, next) {
    const a = req.body.a;
    const contract_info2 = a.split(",");
    const contract_num = contract_info2[0];
    // console.log(contract_num);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .sign_contract(contract_num)
      .send({
        from: ass[1],
        gas: 200000,
      })
      .then(function (receipt) {
        console.log(receipt);
        res.redirect("/contract/list");
      });
    })
  });

  router.route("/sign_o").get(function (req, res, next) {
    const contract_num = req.query.contract_num;
    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .view_contract(contract_num)
      .call()
      .then(function (receipt) {
        console.log(receipt[0]);
        res.render("contract/sign_o_contract", {contract_info : receipt[0].split(",")});
      });
    })
  });

  router.route("/sign2_o").post(function (req, res, next) {
    const a = req.body.a;
    const contract_info2 = a.split(",");
    const contract_num = contract_info2[0];
    // console.log(contract_num);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .confirm_contract(contract_num)
      .send({
        from: ass[0],
        gas: 200000,
      })
      .then(function (receipt) {
        console.log(receipt);
        res.redirect("/contract/list");
      });
    })
  });

  router.route("/view").get(function (req, res, next) {
    const contract_num = req.query.contract_num;
    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }    
      smartcontract.methods
      .view_contract(contract_num)
      .call()
      .then(function (receipt) {
        console.log(receipt[0]);
        const contract_info = receipt[0].split(",");
        res.render("contract/view_contract", {contract_info : contract_info});
      });
    })
  });

  router.route("/view_contract").post(function (req, res, next) {
    
    res.redirect("/contract/list");
  });

  return router;
};
