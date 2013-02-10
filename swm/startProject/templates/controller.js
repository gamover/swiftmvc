var __controller = module.exports = exports = function (modul)
{
    this.addAction('index', function indexAction (controller)
    {
        this.get(function (req, res)
        {
            modul.getModel('model', function(err, model)
            {
                modul.render({
                    'text': model.getText(true)
                });
            });
        });
    });
};