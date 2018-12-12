// Bamazon Manager View !!

require("dotenv").config();
var inquirer = require("inquirer");
var mysql = require("mysql");

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
    inquirer.prompt({
        name: "menu",
        type: "rawlist",
        message: "Choose a task:",
        choices: [
            "View Products For Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add a New Product",
            "EXIT"
        ]
    }).then(function (answer) {
        if (answer.menu === "View Products For Sale") {
            productsForSale();
        } else if (answer.menu === "View Low Inventory") {
            viewLowInventory();
        } else if (answer.menu === "Add to Inventory") {
            addToInventory();
        } else if (answer.menu === "Add a New Product") {
            addNewProduct();
        } else {
            connection.end();
        }
    })
};

function productsForSale() {
    console.log("Here are the products for sale:");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log(`
            ID: ${res[i].id} | NAME: ${res[i].product_name} | DEPARTMENT: ${res[i].department_name} | PRICE: ${res[i].price} | QOH: ${res[i].stock_quantity}`);
        }
        console.log("----------------------");
    })
    start();
}

function viewLowInventory() {
    console.log("Products with Low Inventory:");
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log(`
            ID: ${res[i].id} | NAME: ${res[i].product_name} | DEPARTMENT: ${res[i].department_name} | PRICE: ${res[i].price} | QOH: ${res[i].stock_quantity}`);
        }
        console.log("-----------------------------");
    })
    start();
}

function addToInventory() {
    console.log("Adjust Inventory");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //console.log(res);
        inquirer.prompt({
            name: "change",
            type: "rawlist",
            message: "Which product would you like to adjust the inventory?",
            choices: function (value) {
                var choicesArray = [];
                for (i = 0; i < res.length; i++) {
                    choicesArray.push(res[i].product_name);
                }
                return choicesArray;
            }
        }).then(function (answer) {
            for (i = 0; i < res.length; i++) {
                if (res[i].product_name === answer.change) {
                    var chosenItem = res[i];
                    inquirer.prompt({
                        name: "inventory_adjustment",
                        type: "input",
                        message: "Please enter new level of inventory",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }).then(function (answer) {
                        connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: answer.inventory_adjustment
                        }, {
                            id: chosenItem.id
                        }], function (err, res) {
                            console.log("Inventory has been adjusted.");
                            console.log("-------------------------------");
                            start();
                        })
                    })
                }
            }
        })
    })
}

function addNewProduct() {
    console.log("Add a new product");
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "What is the name of this product?"
    }, {
        name: "department",
        type: "input",
        message: "What department is this product associated with?"
    }, {
        name: "price",
        type: "input",
        message: "What is the price of the product?"
    }, {
        name: "quantity",
        type: "input",
        message: "What is the quantity you wish to add to stock?"
    }])
    .then(function(answer){
        //console.log(answer.name, answer.department, answer.price, answer.quantity);
        connection.query("INSERT INTO products SET ?",{
            product_name: answer.name,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.quantity
        }, function(err, res){
            console.log("Your product was successfully added!");
            console.log("--------------------------------");
            start();
        })
    })
}
