

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://0.0.0.0:27017/todolistDB')

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item ({
  name: "Welcome to todolist" 
})

const item2 = new Item ({
  name: "Hit the + button to add task"
})

const item3 = new Item ({
  name: "<-- Hit this to delete task"
})

var itemsArray = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List",listSchema)


app.get("/", function(req, res) {

  
  Item.find().then((item)=>{

    if(item.length == 0){
      Item.insertMany(itemsArray).catch((err)=>{
        console.error(err);
      })
      res.redirect("/");
    } else {
        
        res.render("list", {listTitle:"Work List", newListItems: item});
            
      }
  }).catch((err)=>{
    console.error(err);
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  if(listName === "Work List")
  {
    const newItem = new Item ({
      name: itemName,
    })
    newItem.save();
    Item.findOne({_id: newItem._id}).then((item)=>{
      if(item){
        res.redirect("/")
      }
    })
    
  } else{
    const newItem = new Item ({
      name: itemName,
    })
    List.findOne({name: listName}).then((list)=>{

      list.items.push(newItem)
      list.save();
      res.redirect("/" + listName)
    }).catch((err)=>{
      console.error(err);
    })
  }

  
  /*
  Item.find().then((item)=>{
    res.render("list", {listTitle:"Work List", newListItems: item});
  }).catch((err)=>{
    console.error(err);
  })*/
});

app.post("/delete",(req,res)=>{
  const id = req.body.checkbox;
  const listName = req.body.listName;
  console.log(id);
  if(listName === "Work List"){
    Item.deleteOne({_id: id}).then(()=>{
      console.log("data deleted");
    }).catch((err)=>{
      console.error(err);
    })
    res.redirect("/")
  } else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{ _id: id}}}).then((findList)=>{
      res.redirect("/" + listName)
    }).catch((err)=>{
      console.error(err);
    })
  }
  
})

app.get("/:customListname",(req,res)=>{
  const customListname = req.params.customListname;
  List.findOne({name: customListname}).then((listName)=>{
    if(!listName)
    {
      const list = new List ({
        name: customListname,
        items: itemsArray 
      })

      list.save();
      
    }
    else{
      res.render("list", {listTitle: listName.name, newListItems: listName.items})
    }
  }).catch((err)=>{
    console.error(err);
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
