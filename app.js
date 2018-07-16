var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"), 
    // We had to add method-override because PUT does not work properly see edit page. 
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");
    
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// MOONGOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "First Blog",
//     image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-0.3.5&s=6d29ad4fc357677ca5e622dd74dfc8ae&auto=format&fit=crop&w=500&q=60",
//     body: "Hello this is me!"
// });


// RESTFUL ROUTES
app.get("/", function(req, res) {
   res.redirect("/blogs") 
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
      if(err){
          console.log("ERROR!");
      } else {
          res.render("index", {blogs: blogs}); 
      }
  });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    //create blog
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err){
            res.render("new");
        } else {
             //then redirect
             res.redirect("/blogs");
        }
    });
}); 

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            res.redirect("/bogs");
        } else { res.render("show", {blog: foundBlog})};
    });
});
    
// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        req.body.blog.body = req.sanitize(req.body.blog.body)
        if(err){
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   // Destroy log and redirect
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err) {
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
   });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER IS RUNNING");
});