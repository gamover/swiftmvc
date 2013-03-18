var _swift = require('swiftmvc'),

    model = _swift.require('[index]/model/model'),

    _endvars_;

exports.indexAction = function ()
{
    this.get(function (req, res)
    {
        res.render({
            'text': model.getText(true)
        });
    });
};