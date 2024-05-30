"use strict"
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();
const cookieSession = require('cookie-session');


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');
const options = model.place();

app.use(cookieSession({
  name: 'session',
  secret: '!cS0p#M4z8)6W*QdF@tN2r',
  httpOnly: true,
  sameSite: 'strict'
}));


function middleware (req, res, next){
  if (req.session.user) {
    res.locals.authenticated = true;
    res.locals.name = req.session.user;
  } else 
  res.locals.authenticated = false;
  next();
  }
  app.use(middleware);

//get

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/new_user', (req,res) => {
    res.render('new_user');
  });
  

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/user_reservation', (req, res) => {
    let user_reservations = model.get_user_reservations(req.session.id);
    let username = req.session.user;
    if (user_reservations.length>0){
      res.render('user_reservation', { user_reservations: user_reservations, username: username });
    }
    else{
      res.render('user_reservation', { message : "you did not make any reservation", username: username });
    }
    
  });
  
  
  app.get('/make_reservation',(req,res)=>{
    res.render('make_reservation',{options :options});
  });
  

  app.get('/delete/:reservationId',(req,res)=>{
    res.render('delete',{reservationId : req.params.reservationId});
  });

  //post

  app.post('/login', (req, res) => {
    if (req.body && req.body.name) {
      const login = model.login(req.body.name, req.body.password);
      if (login >=1) {
        req.session.user = req.body.name;
        req.session.id = login;
       res.redirect('/');
      }      else if (login === -1){
        res.render('login',{message:"Username or password incorrect. Make sure you have an account"})
      }
    } else {
      res.redirect('/login');
    }
  });
  
  app.post('/new_user', (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const id = model.new_user(name, password);
    req.session.user = name;
    req.session.id = id;
    res.redirect('/');
  });
  


app.post('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});


app.post('/make_reservation', (req, res) => {
  const id = req.session.id;
  const parkingName = req.body.parkingName;
  const startDateTimeStr = `${req.body['start-date']} ${req.body['start-time']}:00`;
  const endDateTimeStr = `${req.body['end-date']} ${req.body['end-time']}:00`;
  const slotNumber = model.get_next_available_slot(parkingName, startDateTimeStr, endDateTimeStr);
  var now = new Date();
  now.setHours(now.getHours() + 2);
  var formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
  
  //console.log(formattedDate);
  //console.log(startDateTimeStr);
  //console.log(startDateTimeStr < formattedDate );


  if (startDateTimeStr < formattedDate ){
    let message = 'Please pick a valable date';
    res.render('make_reservation', { message: message, options: options});
  }
  else if (slotNumber === -1){
    let message = 'The slots are not available at that time. Please choose another date.';
    res.render('make_reservation', { message: message, options: options});
  }

  else  {
    model.add_reservations(id, parkingName, slotNumber, startDateTimeStr, endDateTimeStr);
    req.session.id = id;
    res.redirect('/user_reservation');
  } 
});



app.post('/delete/:reservationId',(req,res)=>{
  model.delete_reservation(req.params.reservationId);
  res.redirect('/user_reservation');
});

setInterval(function() {
  model.ended_reservations();
}, 60000);


app.listen(3000, () => console.log('listening on http://localhost:3000'));
