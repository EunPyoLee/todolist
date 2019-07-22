//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Jason:Bren@0506@cluster0-t5eec.mongodb.net/todolistDB", {useNewUrlParser:true});



const itemsSchema = {
  name :{
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemsSchema);

const default1 = new Item({
  name: "Welcome to your todolist!"
});

const default2 = new Item({
  name: "You can add a new item by hitting + button"
});

const default3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [default1, default2, default3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully added default items to DB");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}


});

//express dynamic routing, using route parameter
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //does not exist so create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
