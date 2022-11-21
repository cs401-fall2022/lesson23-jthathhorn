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
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='blog'`,
        (err, rows) => {
          if (rows.length === 1) {
            console.log("Table exists!");
            db.all(` SELECT blog_id, blog_txt FROM blog`, (err, rows) => {
              console.log("returning " + rows.length + " records");
// ?--what exactly is happening below (in 'render' method)?
              res.render('index', { title: 'BLog', data: rows });
        //  db.
              db.close();
            });
          } else {
            console.log("Creating table and inserting some sample data");
            db.exec(`CREATE table blog (
                     blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     blog_txt text NOT NULL);
                      INSERT into blog (blog_txt)
                      VALUES ('This is a great blog'),
                             ('Oh my goodness blogging is fun');`,
              () => {
                db.all(` SELECT blog_id, blog_txt FROM blog`, (err, rows) => {
                  res.render('index', { title: 'Blog', data: rows });
                  db.close();
                });
              });
          }
        });
    });
});

router.post('/add', (req, res, next) => {
  console.log("Adding (sanitized) blog entry to table")
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("inserting " + req.body.blog);
      // sanitized statement
      db.run('INSERT into blog (blog_txt) VALUES (?);', req.body.blog);
      db.close();
      //redirect to homepage
      res.redirect('/');
    }
  );
})

// edit??? return err statement if post DNE?
router.post('/update', (req, res, next) => {
  console.log("editing blog post...");
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

// ? correct use of identifier? (req.body.blog_num)
      console.log("Editing blog post # " + req.body.blog);
      // sanitized statement
      db.run('DELETE from blog WHERE blog_id=(?)', req.body.blog)
      
      
      
      db.close();
      res.redirect('/');
    }
  );
})


router.post('/delete', (req, res, next) => {

// need to validate data before delete?/handle err?
  console.log("deleting stuff without checking if it is valid! SEND IT!");
  
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Deleting blog post # " + req.body.blog);
      // sanitized statement
      db.run('DELETE from blog WHERE blog_id=(?)', req.body.blog)
      db.close();
      res.redirect('/');
    }
  );
})


module.exports = router;