/*
table "usersettings" :
id (should be a guid, pk) , awpm
*/

var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

client.query('DROP TABLE IF EXISTS users;', function(err, result) {
  if (err) {
    return console.log("Error : "+ err);
  }
  console.log("table dropped");
});

var createSQL = "CREATE TABLE users (\
  id      varchar(36) PRIMARY KEY,\
  wpm    int);"

//var createSQL = "CREATE TABLE urls ( id BIGSERIAL PRIMARY KEY);";


client.query(createSQL , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("table created");
});


/*

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
}

UPDATE table SET field='C', field2='Z' WHERE id=3;
INSERT INTO table (id, field, field2)
       SELECT 3, 'C', 'Z'
       WHERE NOT EXISTS (SELECT 1 FROM table WHERE id=3);


*/

var pg = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();


client.query("insert into users (id,wpm) values ('ac68abb5-88f5-07b5-44c5-b3cb80171bd8',160);" , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("line inserted");
});

var g='cc68abb5-88f5-07b5-44c5-b3cb80171bd8';

client.query("update users set wpm=$2 WHERE id=$1;",[g,120], function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("line modified");
});
client.query("insert into users (id,wpm) select $1::VARCHAR, $2 where not exists (select 1 from users where id=$1::VARCHAR);",
      [g,110],
      function(err, res) {
  if (err) {
    return console.error(err);
  }
  console.log("line inserted");
});


client.query("select * from users where id = $1", [g] , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("lines selected : "+JSON.stringify(res.rows));
});




client.query("insert into users (id,wpm) values ('fc68abb5-88f5-07b5-44c5-b3cb80171bd8',160);" , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("line inserted");
});




client.query("insert into users (id,wpm) values ('fc68abb5-88f5-07b5-44c5-b3cb80171bd8',160);" , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("line inserted");
});

client.query("select * from users where id = $1", ['fc68abb5-88f5-07b5-44c5-b3cb80171bd8'] , function(err, res) {
  if (err) {
    return console.error("Error:"+err);
  }
  console.log("lines selected : "+JSON.stringify(res.rows));
});

