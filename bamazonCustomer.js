// customer.js Welcome to bamazon!!!!
require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(function (error) {
    if (error) throw error;
    console.log("connected as id: " + connection.threadId);
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log(`
            Product Id: ${res[i].id}
            Product Name: ${res[i].product_name}
            Department: ${res[i].department_name}
            Price: ${res[i].price}
            Quantity in Stock: ${res[i].stock_quantity}`)
        };
        inquirer.prompt({
            name: "item",
            type: "rawlist",
            choices: function () {
                var choicesArray = [];
                for (i = 0; i < res.length; i++) {
                    choicesArray.push(res[i].product_name);
                }
                return choicesArray;
            },
            message: "Which product would you like to buy?",
        }).then(function(answer) {
            if(err) throw err;
            for (i = 0; i < res.length; i++) {
                if (res[i].product_name == answer.item) {
                    var chosenItem = res[i];
                    inquirer.prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many would you like to buy?",
                        validate: function (value) {
                            if (isNaN(value) == false) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }).then(function (answer) {
                        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
                            var updateInventory = chosenItem.stock_quantity - parseInt(answer.quantity);
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                stock_quantity: updateInventory
                            }, {
                                id: chosenItem.id
                            }], function () {
                                var sum = chosenItem.price * parseInt(answer.quantity);
                                console.log("Product successfully added to shopping cart!");
                                console.log(`
                                You purchased: ${chosenItem.product_name}
                                at the price of: $${chosenItem.price}
                                with a quantity of: ${parseInt(answer.quantity)}
                                Your subtotal is : $${sum}
                                Thanks for your purchase!`);
                                connection.end();
                            })
                        } else {
                            console.log("Could not add to cart. Quantity insufficent");
                            start();
                        }
                    })
                }
            }
        })
    })
};