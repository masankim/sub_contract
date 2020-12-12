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
    res.render("payment/payment_company");
  });

  router.route("/apply_list").get(function (req, res, next) {web3.eth.getAccounts(function(err, ass){
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
                var payment_list = new Array();
                for(var i =0; i < count; i++){
                  smartcontract.methods
                  .view_payments(result2[i].contract_num)
                  .call()
                  .then(function (receipt) {
                    console.log(receipt);
                    // console.log(receipt[1]);
                    // console.log(receipt[4]);
                    const contract_info = receipt[0].split(",");
                    contract_list.push(contract_info);
                    contract_state.push(receipt[1]);
                    payment_list.push(receipt[4]);

                  });
                }
                setTimeout(() => {
                  // console.log(contract_list);
                  // console.log(payment_list);
                  res.render("payment/apply_list", 
                  {
                    contract_info : contract_list, 
                    contract_state : contract_state, 
                    payment_list: payment_list
                  })
                }, 2000);
              }
            }
          )
        }
      }
    )    
  })
}
);

router.route("/list").get(function (req, res, next) {web3.eth.getAccounts(function(err, ass){
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
                // console.log(result2[i].contract_num);
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
                res.render("payment/contract_list", 
                {
                  contract_info : contract_list, 
                  contract_state : contract_state,
                })
              }, 2000);
            }
          }
        )
      }
    }
  )    
})
}
);

router.route("/p_list").get(function (req, res, next) {
  const contract_num = req.query.contract_num;
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
    .view_count()
    .call()
    .then(function (receipt) {
      // console.log(receipt);
      var payment_list = new Array();
      for(var i=0; i < receipt; i++){
        smartcontract.methods
        .view_payment(i)
        .call()
        .then(function (receipt2) {
          console.log(i, "payment list", receipt2[0]);
          if (contract_num == receipt2[0]){
            payment_list.push(receipt2);
          }
        });
      }
      
      setTimeout(() => {
        // console.log(payment_list);
        res.render("payment/payment_list", {payment_list: payment_list});
      }, 2000);
    });
  })
});

  router.route("/request").get(function (req, res, next) {
    const contract_num = req.query.contract_num;
    const p_state = req.query.p_state;
    // console.log(contract_num, p_state);
    var contract_info = new Array();
    contract_info.push(contract_num);
    connection.query(
      `select a_company from contract where contract_num = ?`,
      [contract_num],
      function(err, result){
        if(err){
          console.log(err)
        }else{
          if (p_state == 1){
            console.log("result = ", result)
            smartcontract.methods
            .view_contract(contract_num)
            .call()
            .then(function (receipt){
              console.log("view_contract = ",receipt);
              const receipt_split = receipt[0].split(',');
              contract_info.push(result[0].a_company);
              contract_info.push(receipt_split[8]);
              contract_info.push(receipt_split[1]);
              console.log(receipt_split);
              smartcontract.methods
              .view_payment_state(contract_num)
              .call()
              .then(function (receipt2){
                console.log("view_contract_state = " , receipt2)
                contract_info.push(receipt2[1]);
                contract_info.push(receipt2[2]);
                contract_info.push(receipt2[3]);
                contract_info.push(receipt2[5]);
                console.log("contract_info = ", contract_info);
                res.render("payment/confirm_payment", {contract_info : contract_info});
              });
            })
          }else if (p_state == 2){
            smartcontract.methods
            .view_contract(contract_num)
            .call()
            .then(function (receipt){
              // console.log(receipt);
              const receipt_split = receipt[0].split(',');
              contract_info.push(result[0].a_company);
              contract_info.push(receipt_split[8]);
              contract_info.push(receipt_split[1]);
              // console.log(receipt_split);
              smartcontract.methods
              .view_payment_state(contract_num)
              .call()
              .then(function (receipt2){
                console.log("view_contract_state = " , receipt2[5])
                contract_info.push(receipt2[1]);
                contract_info.push(receipt2[2]);
                contract_info.push(receipt2[3]);
                contract_info.push(receipt2[5]);
                res.render("payment/check_payment", {contract_info : contract_info});
              });
            })
            

          }else{
            smartcontract.methods
            .view_contract(contract_num)
            .call()
            .then(function (receipt){
              // console.log(result[0].a_company);
              const receipt_split = receipt[0].split(',');
              contract_info.push(result[0].a_company);
              contract_info.push(receipt_split[8]);
              contract_info.push(receipt_split[1]);
              console.log(receipt_split);
              res.render("payment/request_payment", {contract_info : contract_info});
            })
          }
        }
      }
    )
  });

  router.route("/pay").post(function (req, res, next) {
    const contract_num = req.body.contract_num;
    const ready_made_cost = req.body.ready_made_cost;
    const labor_cost = req.body.labor_cost;
    const exception_cost = req.body.exception_cost;
    const etc = req.body.etc;
    console.log(contract_num);
    console.log(ready_made_cost);
    console.log(labor_cost);
    console.log(exception_cost);
    console.log(etc);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }   
      console.log(ass[1]);
      smartcontract.methods
      .request_payment(contract_num, ready_made_cost, labor_cost, exception_cost, etc)
      .send({
        from: ass[1],
        gas: 2000000,
      })
      .then(function(receipt){
        console.log(receipt)
        res.redirect("/payment/apply_list");
      });
    })
  });
  
  router.route("/confirm").post(function (req, res, next) {
    const contract_num = req.body.contract_num;
    const ready_made_cost = req.body.ready_made_cost;
    const labor_cost = req.body.labor_cost;
    const exception_cost = req.body.exception_cost;
    const etc = req.body.etc;
    // console.log(contract_num);
    // console.log(ready_made_cost);
    // console.log(labor_cost);
    // console.log(exception_cost);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }   
      smartcontract.methods
      .payment(contract_num, ready_made_cost, labor_cost, exception_cost, etc)
      .send({
        from: ass[0],
        gas: 2000000,
      })
      .then(function(receipt){
        console.log(receipt)
        res.redirect("/payment/apply_list");
      });
    })
  });


  router.route("/check").post(function (req, res, next) {
    const contract_num = req.body.contract_num;
    const ready_made_cost = req.body.ready_made_cost;
    const labor_cost = req.body.labor_cost;
    const exception_cost = req.body.exception_cost;
    const etc = req.body.etc;
    // console.log(contract_num);
    // console.log(ready_made_cost);
    // console.log(labor_cost);
    // console.log(exception_cost);

    web3.eth.getAccounts(function(err, ass){
      if(err != null){
        console.log(err);
        return
      }
      if(ass.length == 0){
        console.log("Account defind")
      }   
      smartcontract.methods
      .confirm_payment(contract_num, ready_made_cost, labor_cost, exception_cost, etc)
      .send({
        from: ass[1],
        gas: 2000000,
      })
      .then(function(receipt){
        console.log(receipt)
        res.redirect("/payment/apply_list");
      });
    })
  });

  router.route("/view").post(function (req, res, next) {
    res.redirect("/payment/apply_list");
  });

  router.route("/refuse").get(function (req, res, next) {
    res.render("payment/refuse_payment");
  });

  return router;
};
