const path = require('path');
//const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const socketApi = require('./socketApi');
// const engine = require('ejs-locals');

//const io = require('socket.io')(5500);
const session = require('express-session')({
	secret: 'cuir cuir',
	resave: true,
	saveUninitialized: true,
});
const app = express();
const errorController = require('./controllers/error');

const db = require('./db/database');
app.use(fileUpload())



// app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

socketApi.io.use((socket, next) => {
	session(socket.request, socket.request.res, next);
});

app.use(session);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);

const port = process.env.PORT || 3000;

// //////////////////// PRENIUM PAYMENT SETUP ////////////////////////

// // const stripe = require('stripe')('sk_test_N3UudY7bAHrecVaZBf0DkVQq000i68Czb4');
// (async () => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 29.99 * 100,
//     currency: 'eur',
//   });
// })();

////////////////////            ////////////////////////


let server = app.listen(port);

socketApi.io.attach(server);