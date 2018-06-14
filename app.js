const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const db = require('./db');
// const jwt = require('./helper');
// main route
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const fabricproviderRouter =  require('./routes/fabric/fabricprovider');
const fabriccolorRouter =require('./routes/fabric/fabriccolor');
const fabrictypeRouter =require('./routes/fabric/fabrictype');
const fabricimportRouter =require('./routes/fabric/fabricimport');
const fabricexportRouter =require('./routes/fabric/fabricexport');
const fabricwarehouseRouter =require('./routes/fabric/fabricwarehouse');


const accessLinkRouter = require('./routes/auth/accesslink');
const menusRouter = require('./routes/auth/menu');

// admin route
const groupRoute = require('./routes/auth/group');
const roleRoute = require('./routes/auth/role');
const userRoute = require('./routes/auth/user');
const app = express();

// CORS setup
app.use(cors());

// file upload setup
app.use(fileUpload());

app.set('views', path.join(__dirname, 'client/build'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'upload')));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/user', authRouter);
app.use('/api/admin/group', groupRoute);
app.use('/api/admin/role', roleRoute);
app.use('/api/admin/user', userRoute);
// route middleware to verify a token
// app.use((req, res, next) => {
//   console.log(req.path);
//   if(req.path.match(/\/file\//) || !req.path.match(/\/api\//)){
//     next();
//   }
//   else{
//     // check header or url parameters or post parameters for token
//     var header = req.headers.authorization.split(' ');
//     var token = header[1];
//     // decode token
//     if (!jwt.verifyToken(token)) {
//       return res.status(401).send('Failed to authenticate token.');    
//     } else {
//       next();
//     }
//   }
// });

app.use('/api/upload',uploadRouter);

app.use('/api/fabric/provider',fabricproviderRouter);
app.use('/api/fabric/type',fabrictypeRouter);
app.use('/api/fabric/color',fabriccolorRouter);
app.use('/api/fabric/import',fabricimportRouter);
app.use('/api/fabric/export',fabricexportRouter);
app.use('/api/fabric/warehouse',fabricwarehouseRouter);

app.use('/api/admin/accesslink',accessLinkRouter);
app.use('/api/admin/menu',menusRouter);

app.get('*', (req,res)=>{
  res.render('index');
})
// catch 404 and forward to error handler
app.use((req, res, next)=> {
  next(createError(404));
});

// error handler
app.use((err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send(err.message);
});

module.exports = app;
