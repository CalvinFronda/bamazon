var mysql = require("mysql");
var inquirer = require("inquirer");

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
  start();
});

function start() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "command",
        message: "Please select what you would like to do",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to inventory",
          "Add New product"
        ]
      }
    ])
    .then(function(response) {
      if (response.command === "View Products for Sale") {
        viewProducts();
      } else if (response.command === "View Low Inventory") {
        viewLow();
      } else if (response.command === "Add to inventory") {
        addInv();
      } else if (response.command === "Add New product") {
        addProduct();
      }
    });
}

function addInv() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item",
        message: "Please enter the ID for the item you would like to add."
      },
      {
        type: "input",
        name: "qty",
        message: "Please enter the amount you would like to add."
      }
    ])
    .then(function(data) {
      var item = data.item;
      var quantity = data.qty;

      connection.query(
        "SELECT * FROM products WHERE ?",
        { item_id: item },
        function(err, res) {
          if (err) throw err;
          if (data.length === 0) {
            console.log("Error please enter a correct ID");
            addInv();
          } else {
            var product = res[0];
            var update =
              "UPDATE products SET stock_quantity = " +
              (parseInt(product.stock_quantity) + parseInt(quantity)) +
              " WHERE item_id = " +
              item;
            connection.query(update, function(err, res) {
              if (err) throw err;

              console.log(
                `Stock item for ID ${item} has been updated to ` +
                  (parseInt(product.stock_quantity) + parseInt(quantity)) +
                  "."
              );
              console.log("\n-------------------------------------");
              connection.end();
            });
          }
        }
      );
    });
}

function addProduct() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the product name?"
      },
      {
        type: "input",
        name: "department",
        message: "What is the product's department?"
      },
      {
        type: "input",
        name: "price",
        message: "What is the price of the product?"
      },
      {
        type: "input",
        name: "stock",
        message: "What is the Quantity?"
      }
    ])
    .then(function(data) {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: data.name,
          department_name: data.department,
          price: data.price,
          stock_quantity: data.stock
        },
        function(err) {
          if (err) throw err;
          console.log("You've successfully added an item!");
        }
      );
    });
}

function viewLow() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(
    err,
    res
  ) {
    if (err) throw err;
    console.log("Here are the low Invetory Items");
    for (var i = 0; i < res.length; i++) {
      var item = res[i];
      console.log(
        `Item: ${item.product_name}` + "\n" + `Stock: ${item.stock_quantity}`
      );
    }
    whatToDo();
  });
}

function viewProducts() {
  console.log("Here are the products!");
  connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      var item = res[i];
      console.log(
        `ID: ${item.item_id}, Name: ${item.product_name}, Department: ${
          item.department_name
        }, Price: ${item.price}, Stock: ${item.stock_quantity} `
      );
      console.log("--------------------------------");
    }
    whatToDo();
  });
}

function whatToDo() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "message",
        choices: ["Return to home", "Leave"],
        message: "What would you like to do?"
      }
    ])
    .then(function(data) {
      if (data.message === "Return to home") {
        start();
      } else {
        connection.end();
      }
    });
}
