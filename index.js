require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const Item = require('./post');

// Connect to the database before creating the Express app
const connectDB = require('./db');
connectDB();

const app = express();

const PORT = process.env.PORT || 5000; // Corrected the order of PORT assignment

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: String
});

const ListSchema = new Schema({
  name: String,
  items: [ItemSchema]
});

const List = mongoose.model('List', ListSchema);

const day = date.getDate();

app.get("/", async function(req, res) {
  try {
    const data = await Item.find();
    
    res.render("list", { listTitle: day, newListItems: data });
    console.log("successfully added a new item");
  } catch (error) {
    console.log(error);
  }
});

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  try {
    if(listName === day){
      await item.save();
    res.redirect("/");
    }else{
      let foundList = await List.findOne({ name: listName }).exec();
      foundList.items.push(item)
      foundList.save();
      res.redirect("/" + listName)
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    if (listName !== day) {
     
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );

      res.redirect("/" + listName);
    } else {
      await Item.findOneAndDelete({ _id: checkedItemId });

      console.log("Successfully deleted");
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});


app.get("/:customListName", async function(req, res) {
  const customListName = req.params.customListName;

  try {
    let foundList = await List.findOne({ name: customListName }).exec();
    if (!foundList) {
      
      const list = new List({
        name: customListName,
        items: [] 
      });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (error) {
    console.log(error);
  }
});

const workItems = [];

app.get("/work", function(req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});


// // Function to insert initial data for the "Item" model
// function insertPostData() {
//   Item.insertMany([
//     {
//       name: "thomas lorem"
//     },
//     {
//       name: "thomas stardog"
//     },
//     {
//       name: "goodluck simoen lorem"
//     },
//     {
//       name: "whatevr you do is good"
//     }
//   ]);
// }

// // Call the insertPostData function to insert initial data for the "Item" model
// insertPostData();