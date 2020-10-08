var express = require('express');
const { merge, off } = require('../app');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId
// const cookieParser = require('cookie-parser');


module.exports = (db, coll) => {

  router.get('/', function (req, res, next) {
    let url = req.url == '/' ? '/?page=1' : req.url;

    let page = req.query.page || 1
    let start = page * 3 - 3
    let limit = 3
    let offset = (page - 1) * limit

    db.collection('tbl_typedata').countDocuments({}, function (err, pages) {
      pages = Math.ceil(pages / limit)
      db.collection('tbl_typedata').find({}).limit(limit).skip(offset).toArray().then(result => {
        res.render('index', { result, pages, page, url, start })
      }).catch(err => console.log(err))
    })
  });

  router.get('/add', function (req, res, next) {
    res.render('add')
  });

  router.post('/add', function (req, res, next) {
    const data = {
      "string": req.body.string,
      "integer": req.body.integer,
      "float": req.body.float,
      "date": req.body.date,
      "boolean": req.body.boolean
    }

    db.collection('tbl_typedata').insertOne(data)
    db.collection('tbl_typedata').find({}).toArray().then(result => {
      res.redirect('/')
    }).catch(err => console.log(err))

  });

  router.get('/edit/:id', function (req, res, next) {
    let o_id = new ObjectId(req.params.id)
    db.collection('tbl_typedata').find({ "_id": o_id }).toArray(function (err, result) {
      if (err) throw err;
      res.render('edit', { result })
    })
  });

  router.post('/edit/:id', function (req, res, next) {
    let o_id = new ObjectId(req.params.id)
    const data = {
      "string": req.body.string,
      "integer": req.body.integer,
      "float": req.body.float,
      "date": req.body.date,
      "boolean": req.body.boolean
    }
    db.collection('tbl_typedata').update({ "_id": o_id }, data, function (err, result) {
      if (err) throw err;
      res.redirect('/')
    })
  });

  router.get('/delete/:id', function (req, res, next) {
    let o_id = new ObjectId(req.params.id)
    db.collection('tbl_typedata').remove({ "_id": o_id }, function (err, result) {
      if (err) throw err;
      res.redirect('/')
    })
  });

  router.get('/filter', function (req, res, next) {
    let url = req.url == '/filter' ? '/filter?page=1' : req.url;

    let page = req.query.page || 1
    let start = page * 3 - 3
    let limit = 3
    let offset = (page - 1) * limit

    let { cstring, string, cinteger, integer, cfloat, float, cdate, startdate, enddate, cboolean, boolean } = req.query;
    let condition = []
    if (cstring && string) {
      condition.push({ string })
    }

    if (cinteger && integer) {
      condition.push({ integer })
    }

    if (cfloat && float) {
      condition.push({ float })
    }

    if (cdate && startdate && enddate) {
      condition.push({ date: { $gte: startdate, $lte: enddate } })
    }

    if (cboolean && boolean) {
      condition.push({ boolean })
    }

    if (Object.keys(req.query).length == 0) {
      let result = []
      pages = 0
      res.render('filter', { result, pages, page, url })
    } else {
      db.collection('tbl_typedata').countDocuments({ $or: condition }, function (err, total) {
        let pages = Math.ceil(total / limit)

        db.collection('tbl_typedata').find({ $or: condition }).limit(limit).skip(offset).toArray(function (err, result) {
          if (err) throw err;
          res.render('filter', { result, pages, page, url, start })
        })
      })
    }

  });

  return router;
}