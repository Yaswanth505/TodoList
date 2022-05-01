const express = require("express");
const app =  express();
const _ = require("lodash");
const mongoose = require("mongoose");


app.use(express.urlencoded({extended:true})); 

app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb://localhost:27017/todoListDB");
//schema creation
const itemsSchema = {
    name : String
};
//model creation
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name : "Welcome to my TODO List"});
const item2 = new Item({name : "Click + button to add into list"});
const item3 = new Item({name : "mark the check box to delete"});

const defaultItems = [item1,item2,item3];

const listsSchema = {
    name : String,
    items : [itemsSchema]
}

const List = mongoose.model("List",listsSchema);

app.get("/",function(req,res){
 
    Item.find({},function(err,foundItems){
        if(foundItems == 0)
        {
            Item.insertMany(defaultItems,function(err){
                if(err)
                    console.log(err);
                else
                    console.log("Successfully added into db");
            });
            res.redirect("/");
        }
        else
            res.render("list",{kind_of_day: "Today",Dotasks:foundItems});
    });
    
    
});


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    // if(customListName == )

    List.findOne({name : customListName},function(err,foundList){
        if(!err){
            if(!foundList)
            {
                //console.log("Doesn't exist");
                const list = new List({
                    name:customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                //console.log("exist");
                res.render("list",{kind_of_day: foundList.name,Dotasks:foundList.items});
            }
        }
    });
        // console.log("customListName : "+ customListName);
        
    });

app.post("/",function(req,res){
    const itemName = req.body.NewItem;
    const list = req.body.list;
    const item = new Item({name : itemName});
    if(list === "Today")
    {
        item.save();
        res.redirect("/"); 
    }
    else{
        List.findOne({name:list},function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+list);
        });
        
    }
    
});

app.post("/delete",function(req,res){
   const checkedInput = req.body.checkbox;
   const Category = req.body.category;
   console.log("delete : "+Category);
   if(Category === "Today")
   {
        Item.findByIdAndRemove(checkedInput,function(err){
            if(!err){
                console.log("deleted successfully");
                res.redirect("/");
            }
        });
   }
   else
   {
       List.findOneAndUpdate({name : Category},{$pull : {items : {_id : checkedInput}}}, function(err,foundList){
           if(!err){
               res.redirect("/"+Category);
           }
       })
   }
   
});

app.listen(3000,function(){
    console.log("Server is running at port 3000");
    
});

/**
 * let date = new Date();
    var options = {
       //day:"numeric",
        weekday:"long",
        //month:"long"
    };
    var day = date.toLocaleDateString("en-us",options);
 */