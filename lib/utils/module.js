/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 */

var _fs = require('fs'),
    _path = require('path'),
    _callback = require('./callback');

exports.requireModule = function (pathToFile, callback)
{callback = _callback(callback);

    var mod = {};

    pathToFile = _path.resolve(pathToFile);

    var pathToDir = _path.dirname(pathToFile),
        fileName = _path.basename(pathToFile);

    if (_path.extname(fileName) !== '.js')
    {
        fileName += '.js';
    }

    pathToFile = pathToDir + '/' + fileName;

    if (!_path.existsSync(pathToFile))
    {
        var messages = ['Не удалось подключить модуль. Модуль "' + pathToFile + '" не найден.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return mod;
    }

    mod = require(pathToFile);

    callback({
        status: 'success',
        data: mod
    });

    return mod;
};

/**
 * Подключение модулей из директории
 *
 * @param pathToDir путь к директории
 * @param callback
 *
 * @return {{}}
 */
exports.requireDirectory = function (pathToDir, callback)
{callback = _callback(callback);

    var mods = {};

    pathToDir = _path.resolve(pathToDir);

    if (!_path.existsSync(pathToDir))
    {
        var messages = ['Не удалось подключить модули из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return mods;
    }

    //
    // подключение модулей
    //

    _fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (_path.extname(filename) !== '.js')
        {
            return;
        }

        var name = _path.basename(filename, '.js');

        mods.__defineGetter__(name, function ()
        {
            return require(pathToDir + '/' + name);
        });
    });

    callback({
        status: 'success',
        data: mods
    });

    return mods;
};

/**
 * Рекурсивное подключение модулей из директории
 *
 * @param pathToDir путь к директории
 * @param callback
 *
 * @return {{}}
 */
exports.requireDirectoryR = function (pathToDir, callback)
{callback = _callback(callback);

    var mods = bypass(pathToDir, {});

    function bypass (pathToDir, mods)
    {
        exports.requireDirectory(pathToDir, function (result)
        {
            if (result.status === 'error')
            {
                callback(result);

                return;
            }

            mods = result.data;

            _fs.readdirSync(pathToDir).forEach(function (filename)
            {
                if (_fs.statSync(pathToDir + '/' + filename).isDirectory())
                {
                    var obj = bypass(pathToDir + '/' + filename, {});
                    mods.__defineGetter__(filename, function ()
                    {
                        return obj;
                    });
                }
            });
        });

        return mods;
    }

    return mods;
};