/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 16:46
 */

var _fs = require('fs'),
    _jsmodule = require('./utils/jsmodule'),
    _callback = require('./utils/callback'),

    config;

var __lib = module.exports = exports = function (config_)
{
    config = config_;

    require('./helpers/url')(config_);

    return __lib;
};

/**
 * Получение модуля библиотеки
 *
 * @param alias алиас модуля (mvc.controller)
 * @param callback
 *
 * @return {{}}
 */
__lib.require = function (alias, callback)
{callback = _callback(callback);

    var pathToFile = __dirname + '/' + alias.split('.').join('/');

    if (_fs.statSync(pathToFile).isDirectory())
    {
        var mods;

        _jsmodule.requireDir(pathToFile, false, function(result)
        {
            if (result.status === 'error')
            {
                result.messages.push('Не удалось получить модули библиотеки "' + alias + '".');
                console.log(result.messages.join('\n') + '\n');

                callback({
                    status: 'error',
                    messages: result.messages
                });

                return;
            }

            mods = result.data;

            callback({
                status: 'success',
                data: mods
            });
        });

        return mods;
    }

    var modul = require(pathToFile);

    callback({
        status: 'success',
        data: modul
    });

    return modul;
};