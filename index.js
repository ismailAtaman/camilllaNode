

//// Global Objects
const express = require('express');
const { json } = require('express');
const app = express();
const fs = require('fs');
const WebSocket = require('ws');

//// Global variables
let strAppConfig;

if (fs.existsSync('camillaNodeConfig.json')) {
    strAppConfig = fs.readFileSync('camillaNodeConfig.json');
} else {
    strAppConfig = JSON.stringify({"port":80})
    fs.writeFileSync('camillaNodeConfig.json',strAppConfig);   
}

let appConfig = JSON.parse(strAppConfig);
PORT = appConfig.port;


app.use(express.static('public'));
app.set('view engine','ejs');

//// Default gets
app.get('/',(req,res)=>{
    res.render('equalizer');     
}) 

app.get('/server',(req,res)=>{
    res.render('server');     
}) 

app.get('/device',(req,res)=>{
    res.render('device');     
}) 

app.get('/plot',(req,res)=>{
    res.render('plot');     
}) 

app.get('/pipeline',(req,res)=>{
    res.render('pipeline');     
}) 

app.get('/abtest',(req,res)=>{
    res.render('abtest');     
}) 


app.get('/settings',(req,res)=>{
    res.render('settings');     
}) 

app.listen(PORT,console.log(`CamillaNode is running on port ${PORT}...`));