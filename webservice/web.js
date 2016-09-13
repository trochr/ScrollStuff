// web.js
var express = require("express");
var logfmt = require("logfmt");
var bodyParser = require('body-parser');
var validator = require('validator');
var sanitizer = require('sanitizer');
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(1000, 'minute',true);

var app = express();

// Setup CORS and Rate Limiting
app.all('*',function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
   limiter.removeTokens(1, function(err, remainingRequests) {
   if (remainingRequests<0) {
      return res.send('429 Too Many Requests - your IP is being rate limited',429);
   }
   else {
     next();
   }
  });
});



app.use( bodyParser.urlencoded({extended: true}) );
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
 var pg = require('pg');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   client.query('SELECT * FROM urls', function(err, result) {
     done();
     if(err) {
        return res.send('Cannot access db');
     }
     res.send('URLs:<pre>'+JSON.stringify(result.rows,undefined, 2));
   });
  });
});

app.post('/url',function(req,res){
  if (!validator.isURL(req.body.url)) {
    return res.send('URL format error : '+req.body.url);
  }
  if (req.body.problem == undefined) {
    req.body.problem = "no";
  }
  if (!validator.matches(req.body.problem,/^(yes|no)$/)) {
    return res.send('Problem format error : '+req.body.problem);
  }
  req.body.comment = sanitizer.escape(req.body.comment);
  if (req.body.comment.length> 140) {
    return res.send('Comment too big : '+sanitizer.escape(req.body.comment));
  }
  var pg = require('pg');

  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.query("insert into urls (url) values ('"+req.body.url+"');", function(err, result) {// FIXME : parametrize
    if (err) {
      return res.send("Error:"+err);
    }
    res.send("url inserted");
  });
});

app.get('/user/settings',function(req,res){
  if (!req.headers.hasOwnProperty('authorization')) {
    return res.send('Missing Authorization header',417);
  }
  var g=req.headers["authorization"];
  if (g.match(/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/)==null) {
    return res.send("Guid provided doesn't look like a guid :"+g,400);
  }
  var pg = require('pg');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   client.query('SELECT * FROM users where id = $1',[g], function(err, result) {
     done();
     if(err) {
        return res.send('Cannot access db',500);
     }
     if (result.rows.length == 0) {
        return res.send('User not found',404);
     }
     res.send(JSON.stringify(result.rows[0]));
   });
  });
});

app.post('/user/settings',function(req,res){
  if (!req.headers.hasOwnProperty('authorization')) {
    return res.send('Missing Authorization header',417);
  }
  var g=req.headers["authorization"];
  if (g.match(/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/)==null) {
    return res.send("Guid provided doesn't look like a guid :"+g,400);
  }
  if (!req.body.hasOwnProperty('wpm')){
    return res.send('Missing wpm parameter',400);
  }
  var wpm = req.body.wpm;
  if (wpm.match(/^[0-9]+$/)==null){
    return res.send("Words per minute doesn't look good : "+wpm,400);
  }
  var pg = require('pg');

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   client.query('update users set wpm=$2 WHERE id=$1;',[g,wpm], function(err, result) {
     if(err) {
        return res.send('Cannot access db',500);
     }
   });
  });
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   client.query('insert into users (id,wpm) select $1::VARCHAR, $2 \
                  where not exists (select 1 from users where id=$1::VARCHAR);'
                  ,[g,wpm], function(err, result) {
     if(err) {
        return res.send('Cannot access db',500);
     }
   });
  });
  return res.send("Settings saved");
});

app.get('/progress/:id',function(req,res){
  var anid = req.param("id"); //"2354829368";
  if (anid.match('^[0-9]{1,20}$') === null ){
    return res.send('Incorrect format for Id',400);
  }

  var pg = require('pg');
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM progress where id = $1::VARCHAR;',[anid], function(err, result) {
      done();
      if(err) {
        return res.send('Cannot access db',500);
      }
      if (result.rows.length == 0) {
        return res.send('Id not found',404);
      }
      return res.send(JSON.stringify(result.rows[0]));
    });
  });
});

app.post('/progress/:id',function(req,res){
  if (!req.headers.hasOwnProperty('authorization')) {
    return res.send('Missing Authorization header',417);
  }
  var g=req.headers["authorization"];
  if (g.match(/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/)==null) {
    return res.send("Guid provided doesn't look like a guid :"+g,400);
  }
  var anid = req.param("id"); //"2354829368";
  if (anid.match('^[0-9]{1,20}$') === null ){
    return res.send('Incorrect format for Id',400);
  }

 if (!req.body.hasOwnProperty('progress')){
    return res.send('Missing progress parameter',400);
  }
  var progress = req.body.progress;
  if (progress.match(/^0\.[0-9]+$/) === null){
    return res.send("Progress doesn't look good",400);
  }
  var pg = require('pg');
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   client.query('update progress set progress=$2,updated=current_timestamp WHERE id=$1;',[anid,progress], function(err, result) {
    done();
    if(err) {
        return res.send(500,'Cannot access db : '+err);
    }
    if (result.rowCount === 0) {
      client.query('insert into progress (id,progress) values ($1,$2);',[anid,progress],function(err2,result){
        done();
        if (err2) {
          return res.send(500,'Cannot access db');
        }
        return res.send("Progress saved (inserted)");
      });
    } else {
      return res.send("Progress saved (updated)");
    }
   });
  });
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
