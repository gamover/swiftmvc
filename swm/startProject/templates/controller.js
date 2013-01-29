exports.indexAction = function (mod)
{
    mod.get(function (req, res)
    {
        var model = mod.getModel('model');

        mod.render('index', {
            'text': model.getText()
        });
    });
};