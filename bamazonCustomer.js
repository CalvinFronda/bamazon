var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "something",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  displayProducts();
});

function start() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "id",
        message: "What is the ID of the product you would like to purchase?"
      },
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to purchase?"
      }
    ])
    .then(function(data) {
      var product = data.id;
      var quantity = data.quantity;

      connection.query(
        `SELECT * FROM products WHERE ?`,
        { item_id: product },
        function(err, res) {
          if (err) throw err;
          if (res.length === 0) {
            console.log("Not an ID, Please select an ID on the list");
            console.log("\n");
            displayProducts();
          } else {
            var productData = res[0];

            if (quantity <= productData.stock_quantity) {
              console.log("Got it");
              connection.query(
                `UPDATE products SET stock_quantity = ${productData.stock_quantity -
                  quantity} WHERE item_id = ${product}`,
                function(err, res) {
                  if (err) throw err;

                  console.log(
                    "Order Placed! Your total is $" +
                      productData.price * quantity
                  );

                  console.log("Thanks for shopping");

                  connection.end();
                }
              );
            } else {
              console.log("Sorry, Not enough stock");
              console.log("\n");
              displayProducts();
            }
          }
        }
      );
    });
}

function displayProducts() {
  console.log("Here are the products!");
  connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      var item = res[i];
      console.log(
        ` ID : ${item.item_id}, Name: ${item.product_name.red}, Department: ${
          item.department_name.yellow
        }, Price: ${item.price}, Stock: ${item.stock_quantity} `
      );
      console.log("--------------------------------");
    }
    start();
  });
}
