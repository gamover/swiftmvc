/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 16:46
 */

var _config = require('./config'),
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

    var mod = {},
        pathToFile = _config.path.lib + '/' + alias.split('.').join('/');

    _jsmodule.require(pathToFile, function(result)
    {
        if (result.status === 'error')
        {
            result.messages.push('Не удалось получить модуль библиотеки "' + alias + '".');
            console.log(result.messages.join('\n') + '\n');

            callback({
                status: 'error',
                messages: result.messages
            });

            return;
        }

        mod = result.data;

        callback({
            status: 'success',
            data: mod
        });
    });

    return mod;
};