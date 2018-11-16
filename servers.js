var express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bodyParser = require('body-parser');
var logger = require('morgan'); 
var marked = require('marked');
var markdown = require('markdown-js');
var fs=require('fs');
var ejs = require('ejs');
var util = require('./util')

var mysql = require("mysql");
var con = mysql.createConnection({
    host     : '127.0.0.1',
    port     : 3306,
    user     : 'root',
    password : 'root',
    database : 'test'
}) 

var app = express(); 
 
app.use(express.static(path.join(__dirname, './assets'))); 
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(logger('short', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


//跨域问题处理
// app.use(cors());
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true'); //告诉客户端可以在HTTP请求中带上Cookie
    next();
});


app.get('/md', function(req, res) {
    try {  
        fs.readFile(path.join(__dirname, './markdown/webkit.md'),function(err,data){
            debugger;
            if (err) return res.status(500).send({ error: 'failed!' });
            var html = markdown.makeHtml(data.toString());
            res.render('log/index', { html: html}); 
        })
    } catch (error) {
        res.status(500).send({ error: 'failed!' });
    } 
});

app.get('/api', function(req, res) {
    try { 
        console.log(JSON.parse(req.query.error))
        con.query('insert into errorlog set ?', JSON.parse(req.query.error), function(err, result) {
            if (err) throw err; 
            res.send({"code":200,"message":"success"});
        }); 
    } catch (error) {
        res.status(500).send({ error: 'Something failed!' });
    }
    //const url = req.query.url;
    //console.log(req.headers.host)
    /* const options = {
        url: urls,
        json: true
    };
    request.get(options, (error, getResponse, body) => {
        if (body.error) {
            res.status(422).send(`Error with Data! Try again!`);
        } else { 
            res.send(body);
        }
    }); */
});
 

app.get('/list', function(req, res) {
    try {  
        con.query('select * from errorlog order by time desc', function(err, data) {
            debugger;
            if (err) return next(err);
            var tables = data.map(function(table){
                table.time = util.timeParse(table.time,'yyyy-MM-dd HH:mm:ss')
                return table;
            });
            //res.sendFile("/JJ-Note/nodeTest/example/example/views/" + "index.html" )
            //res.send(data);
            res.render('index', { data: tables}); 
        });  
    } catch (error) {
        res.status(500).send({ error: 'failed!' });
    } 
});

app.get('/query', function(req, res) {
    try {  
        con.query('select * from errorlog where msg like "%'+req.query.key+'%"', function(err, data) { 
            debugger;
            if (err) return res.status(500).send({ error: 'failed!' });

             var tables = data.map(function(table){
                table.time = util.timeParse(table.time,'yyyy-MM-dd HH:mm:ss')
                return table;
            }); 
            res.render('index', { data: tables});
        });  
    } catch (error) {
        res.status(500).send({ error: 'failed!' });
    } 
});

app.listen(5000, function() {
    console.log('web/',`Please open in the browser localhost:5000/`);
});