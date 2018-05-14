const inquirer = require("inquirer");
const mysql    = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "F1|21NMuHlax0RbZ",
  database: "bamazon_db"
});

// validateInput makes sure that the user is supplying only positive integers for their inputs
function validateInput(value) {
  var integer = Number.isInteger(parseFloat(value));
  var sign = Math.sign(value);

  if (integer && (sign === 1)) {
    return true;
  } else {
    return 'Please enter a whole non-zero number.';
    }
};

// promptUserPurchase will prompt the user for the item/quantity they would like to purchase
function promptUserPurchase() {
  // Prompt the user to select an item
  inquirer.prompt([
  {
  type: 'input',
  name: 'item_id',
  message: 'Enter the Item ID of the item you would like to purchase.',
  validate: validateInput,
  filter: Number
  },
  {
  type: 'input',
  name: 'quantity',
  message: 'How many would you like?',
  validate: validateInput,
  filter: Number
  }
  ]).then(function(input) {

  var item = input.item_id;
  var quantity = input.quantity;

  // Query db to confirm that the given item ID exists in the desired quantity
  var queryStr = 'SELECT * FROM products WHERE ?';

  connection.query(queryStr, {item_id: item}, function(err, data) {
    if (err) throw err;

    if (data.length === 0) {
      console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
      
      displayInventory();
      } else {

          var productData = data[0];

          // If the quantity requested by the user is in stock
          if (quantity <= productData.stock_quantity) {

            // Construct the updating query string
            var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

            // Update the inventory
            connection.query(updateQueryStr, function(err, data) {
              if (err) throw err;

              console.log('You have ordered ' + quantity + 'x ' + productData.product_name); 
              console.log('Your total is $' + productData.price * quantity);
              console.log('Thank you for shopping with Bamazon!');
              console.log("\n----------------------------------------------------------------------------------\n");

              // End the database connection
              connection.end();
            })
          } else {
              console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
              console.log('Please modify your order.');
              console.log("\n----------------------------------------------------------------------------------\n");

              displayInventory();
          }
      }
  })
})
};
  
// Shows current inventory
function displayInventory() {

  queryStr = 'SELECT * FROM products';

  // Make the db query
  connection.query(queryStr, function(err, data) {
    if (err) throw err;

    var strOut = '';
    console.log('----------------------------------------------------------------------------------');
    console.log('Item ID     Product Name                                  Deparment          Price');
    console.log('----------------------------------------------------------------------------------');
    for (var i = 0; i < data.length; i++) {
      strOut = '';
      strOut += data[i].item_id + '           ';
      strOut += data[i].product_name + '              ';
      strOut += data[i].department_name + '        ';
      strOut += '$' + data[i].price + '\n';

    console.log(strOut);
    }

 console.log("----------------------------------------------------------------------------------\n");

 //Prompt the user for item/quantity they would like to purchase
  promptUserPurchase();
  })
};

// Execute logic
function runBamazon() {

  // Display the available inventory
  displayInventory();
};

runBamazon();


//add a promp to ask if user wants to buy more items
//add function that displays available items if user says YES
//if user says NO, then display total and checkout