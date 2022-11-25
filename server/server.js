const fs = require('fs');
const sqlite = require('sqlite3');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/api/user');
var SKURouter = require('./routes/api/SKU');
var SKUItemRouter = require('./routes/api/SKUItem');
var positionRouter = require('./routes/api/position');
var testDescriptorRouter = require('./routes/api/testDescriptor');
var testResultRouter = require('./routes/api/testResult');
var restockOrderRouter = require('./routes/api/restockOrder');
var returnOrderRouter = require('./routes/api/returnOrder');
var internalOrderRouter = require('./routes/api/internalOrder');
var itemRouter = require('./routes/api/item');

const port = 3001;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', usersRouter);
app.use('/api', SKURouter);
app.use('/api', SKUItemRouter);
app.use('/api', positionRouter);
app.use('/api', testDescriptorRouter);
app.use('/api', testResultRouter);
app.use('/api', restockOrderRouter);
app.use('/api', returnOrderRouter);
app.use('/api', internalOrderRouter);
app.use('/api', itemRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

const runQuery = (query, db) => {
	return new Promise((resolve, reject) => {
		db.run(query, [], function (err) {
			if (err) {
				reject(err);
			}else{
				resolve(this.changes);
			}
		});
	});
};

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
/*
const allFileContents = fs.readFileSync(
	path.resolve(__dirname, './classes/DBCreationQuery.sql'),
	'utf-8'
);

const db = new sqlite.Database('./EZWarehouseDB.db', (err) => {
	if (err) throw err;
});

const queries = allFileContents.split(';');
for (let query of queries) {
	runQuery(query, db);
}*/

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
