var _swift = require('swift'),
    _http = require('http'),
    _path = require('path'),
    _swig = require('swig'),
    _consolidate = require('consolidate');

var app = _swift.init().getApp();
app.engine('.swig', _consolidate.swig);

_swig.init({
    'root': _swift.config.path.app + '/view',
    'allowErrors': true
});

app.configure(function () {
    app.set('port', process.env.PORT || _swift.config.server.port);
    app.set('views', _swift.config.path.app + '/view');
    app.set('view engine', 'swig');
    app.use(_swift.express.favicon());
    app.use(_swift.express.logger('dev'));
    app.use(_swift.express.bodyParser());
    app.use(_swift.express.methodOverride());
    app.use(_swift.endslash);
    app.use(_swift.router);
    app.use(app.router);
    app.use(_swift.express.static(_path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(_swift.express.errorHandler());
});

_swift.modules
    .load('index')
    .run()
;

_http.createServer(app).listen(app.get('port'), _swift.config.server.ip, function(){
    console.log("Express server listening on port " + app.get('port'));
});