var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

/* GET home page. */
router.get('/', function (req, res, next) {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //Query if the table exists; if not, create new table
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='blog'`,
        (err, rows) => {
          if (rows.length === 1) {
            console.log("Table exists!");
            db.all(`SELECT blog_id, blog_title, blog_text FROM blog`, (err, rows) => {
              console.log("returning " + rows.length + " records");
              // reverse order of 'rows' array to load newest blogs first
              let newRows = [];
              for(i=0; i < rows.length; i++){
                newRows[i] = rows[(rows.length - 1) - i];
              }
              db.close();
              res.render('index', { title: 'Blog', data: newRows });
            });
          } else {
            console.log("Creating table and inserting some sample data");
            db.exec(`CREATE table blog (
                     blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     blog_title NOT NULL,
                     blog_text text NOT NULL);
                      INSERT into blog (blog_title, blog_text) 
                      VALUES ('Blog #1 Title','This is the first new blog');`,
              () => {
                db.all(` SELECT blog_id, blog_title, blog_text FROM blog`, (err, rows) => {
                  // reverse order of 'rows' array to load newest blogs first      
                  let newRows = [];
                  for(i=0; i<rows.length;i++){
                    newRows[i] = rows[(rows.length - 1) - i];
                  }
                  res.render('index', { title: 'bloG', data: newRows });
                  db.close();
                });
              });
          }

        });
    });
});
// Add a new blog post
router.post('/add', (req, res, next) => {
  console.log("Adding (sanitized) blog entry to table")
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      // sanitized statement
      db.run('INSERT into blog (blog_title, blog_text) VALUES ((?), (?));', 
            req.body.blog_title, req.body.blog_text,
            function(err){
              if(err){
                return console.error("ERROR: "+err.message);
              }
              console.log(`Row(s) added: ${this.changes}`);
            });
      db.close();
      //redirect to homepage
      res.redirect('/');
    }
  );
})

// edit / update blog post
router.post('/edit', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Editing blog post # " + req.body.id);
      // sanitized statement
      db.run('UPDATE blog SET blog_title=(?), blog_text=(?) WHERE blog_id=(?);', 
              req.body.title, req.body.value, req.body.id,
              function(err){
                if(err){
                  return console.error("ERROR: "+err.message);
                }
                console.log(`Row(s) updated: ${this.changes}`);
              });  
      db.close();
      res.redirect('/');
    }
  );
 //   res.redirect('/');

})

// delete a blog post
router.post('/delete', (req, res, next) => {
  
// ?? need to VALIDATE data before delete / handle err ??
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Deleting blog post # " + req.body.id);
      // sanitized statement
      db.run('DELETE from blog WHERE blog_id=(?)', 
              req.body.id,
              function(err){
                if(err){
                  return console.error("ERROR: "+err.message);
                }
                console.log(`Row(s) deleted: ${this.changes}`);
              });
      db.close();
      res.redirect('/');
    }
  );
});


module.exports = router;