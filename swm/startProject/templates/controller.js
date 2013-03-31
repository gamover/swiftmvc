var _swift = require('swiftmvc'),

    model = _swift.require('[index]/model/model');

exports.indexAction = function indexAction ()
{
    this.get(function (req, res)
    {
        res.render({
            text: model.getText(true)
        });
    });
};