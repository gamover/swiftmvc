/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 16:46
 */

var _fs = require('fs'),
    _config = require('./config'),
    _jsmodule = require('./utils/jsmodule'),
    _callback = require('./utils/callback');

/**
 * Получение модуля библиотеки
 *
 * @param alias алиас модуля (mvc.controller)
 * @param callback
 *
 * @return {{}}
 */
exports.require = function (alias, callback)
{callback = _callback(callback);

    var pathToFile = _config.path.lib + '/' + alias.split('.').join('/');

    if (_fs.statSync(pathToFile).isDirectory())
    {
        var mods;

        _jsmodule.reqDir(pathToFile, false, function(result)
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