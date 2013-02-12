var _swift = require('swiftmvc'),

    modul = _swift.modules.get('index'),
    model = modul.requireModel('model'),

    _endvars_;

exports.indexAction = function ()
{
    this.get(function ()
    {
        this.render(null, {
            'text': model.getText(true)
        });
    });
};