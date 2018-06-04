const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const jwt = require('./helper');
const db = require('./db');
// main route
const uploadRouter = require('./routes/upload');
const userRouter = require('./routes/user');
const qaRouter = require('./routes/qaqc');
const planningRouter = require('./routes/planning');
const markerRouter = require('./routes/marker');
const sampleRouter = require('./routes/sample');
const cuttingRouter = require('./routes/cutting');
const numberingRouter = require('./routes/numbering');
const productionRouter = require('./routes/production');
const embroideryRouter = require('./routes/embroidery');
const packagingRouter = require('./routes/packaging');
const fabricqcRouter = require('./routes/fabricqc');
const complianceRouter = require('./routes/compliance');
const trimRouter = require('./routes/trim');
const administrationRouter = require('./routes/administration');
const aqlRouter = require('./routes/aql');
const sewingPlanRouter = require('./routes/sewingplan');
const imexRouter = require('./routes/imex');

const fabricproviderRouter =  require('./routes/fabric/fabricprovider');
const fabriccolorRouter =require('./routes/fabric/fabriccolor');
const fabrictypeRouter =require('./routes/fabric/fabrictype');
const fabricimportRouter =require('./routes/fabric/fabricimport');
const fabricexportRouter =require('./routes/fabric/fabricexport');
const fabricwarehouseRouter =require('./routes/fabric/fabricwarehouse');

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
app.use('/user', userRouter);
// route middleware to verify a token
app.use((req, res, next) => {
  console.log(req.path);
  if(req.path.match(/\/file\//) || !req.path.match(/\/api\//)){
    next();
  }
  else{
    // check header or url parameters or post parameters for token
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    // decode token
    if (!jwt.verifyToken(token)) {
      return res.status(401).send('Failed to authenticate token.');    
    } else {
      next();
    }
  }
});

app.use('/api/upload',uploadRouter);
app.use('/api/qaqc',qaRouter);
app.use('/api/planning',planningRouter);
app.use('/api/marker',markerRouter);
app.use('/api/sample',sampleRouter);
app.use('/api/cutting',cuttingRouter);
app.use('/api/numbering',numberingRouter);
app.use('/api/production',productionRouter);
app.use('/api/embroidery',embroideryRouter);
app.use('/api/packaging',packagingRouter);
app.use('/api/fabricqc',fabricqcRouter);
app.use('/api/compliance',complianceRouter);
app.use('/api/trim',trimRouter);
app.use('/api/administration',administrationRouter);
app.use('/api/aql',aqlRouter);
app.use('/api/sewingplan',sewingPlanRouter);
app.use('/api/imex',imexRouter);

app.use('/api/fabric/provider',fabricproviderRouter);
app.use('/api/fabric/type',fabrictypeRouter);
app.use('/api/fabric/color',fabriccolorRouter);
app.use('/api/fabric/import',fabricimportRouter);
app.use('/api/fabric/export',fabricexportRouter);
app.use('/api/fabric/warehouse',fabricwarehouseRouter);
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
