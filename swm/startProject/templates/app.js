var _swift = require('swift'),
    _path = require('path'),
    _swig = require('swig'),
    _consolidate = require('consolidate');

var app = _swift();
app.engine('.swig', _consolidate.swig);

_swig.init({
    'root': _swift.config.path.app + '/view',
    'allowErrors': true
});

app.configure(function () {
    app.set('view engine', 'swig');
    app.use(_swift.express.favicon());
    app.use(_swift.express.logger('dev'));
    app.use(_swift.express.bodyParser());
    app.use(_swift.express.methodOverride());
    app.use(_swift.router.endslash);
    app.use(_swift.router.route);
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