var $swift = require('swiftmvc'),
    $path = require('path'),
    $swig = require('swig'),
    $consolidate = require('consolidate');

var app = $swift();
app.engine('.swig', $consolidate.swig);

$swig.init({
    'root': $swift.config.path.app + '/view',
    'allowErrors': true
});

app.configure(function () {
    app.set('view engine', 'swig');
    app.use($swift.express.favicon());
    app.use($swift.express.static($path.join(__dirname, 'public')));
    app.use($swift.express.logger('dev'));
    app.use($swift.router.endslash);
    app.use($swift.express.bodyParser());
    app.use($swift.express.methodOverride());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(function (req, res) { throw new Error().status = 404; });
    app.use($swift.express.errorHandler());
});

$swift.modules
    .load('index')
    .run(function (err) { if (err) console.log(err); })
;