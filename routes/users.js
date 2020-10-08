var express = require('express');
var router = express.Router();


module.exports = (db, coll) => {

  router.get('/', function (req, res, next) {
    db.collection('typedata').find({}).toArray().then(result => {
      // assert.equal(err, null)
      console.log("sip")
      console.log(result)
      res.render('index', { result })
    }).catch(err => console.log(err))

  });

  router.post('/', function (req, res, next) {
    res.send('respond with a resource');
  });

  return router;
}