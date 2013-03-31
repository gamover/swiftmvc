/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 *
 * Работа с пакетами node.js
 */

var $fs = require('fs'),
    $path = require('path'),

    fsUtil = require('./fs'),

    nextTick = typeof setImmediate === 'function' ? setImmediate : process.nextTick;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Подключение ресурса (async)
 *
 * @param {String} pathToSource путь к ресурсу
 * @param {Object} params параметры
 * @param {Function} callback
 *
 * @returns {*}
 */
exports.require = function require (pathToSource, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToSource = $path.normalize(pathToSource);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    //
    // проверка на существование ресурса
    //

    fsUtil.exists(pathToSource, function (exists)
    {
        if (!exists)
        {
            pathToSource += '.js';
            fsUtil.exists(pathToSource, function (exists)
            {
                if (!exists)
                {
                    callback();
                    return;
                }

                $fs.stat(pathToSource, function (err, stats)
                {
                    if (err)
                    {
                        callback(err);
                        return;
                    }

                    if (!stats.isFile())
                    {
                        callback();
                        return;
                    }

                    requireSource();
                });
            });
        }
    });

    //
    // подключение ресурса
    //

    function requireSource ()
    {
        $fs.stat(pathToSource, function (err, stats)
        {
            if (err)
            {
                callback(err);
                return;
            }

            if (stats.isDirectory())
            {
                __package.requireDirR(pathToSource, params, callback);
                return;
            }

            callback(null, require(pathToSource));
        });
    }
};

/**
 * Подключение ресурса (sync)
 *
 * @param {String} pathToSource путь к ресурсу
 * @param {Object} params параметры
 *
 * @returns {*}
 */
exports.requireSync = function requireSync (pathToSource, params)
{
    //
    // обработка входных параметров
    //

    pathToSource = $path.normalize(pathToSource);
    params = params || {};

    //
    // проверка на существование ресурса
    //

    if (!fsUtil.existsSync(pathToSource))
    {
        pathToSource += '.js';
        if (!fsUtil.existsSync(pathToSource) || !$fs.statSync(pathToSource).isFile())
        {
            return;
        }
    }

    //
    // подключение ресурса
    //

    if ($fs.statSync(pathToSource).isDirectory())
    {
        return __package.requireDirRSync(pathToSource, params);
    }

    return require(pathToSource);
};

/**
 * Подключение пакетов из директории (async)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 * @param {Function} callback
 */
exports.requireDir = function requireDir (pathToDir, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToDir = $path.normalize(pathToDir);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    else
    {
        params.exclude = {};
    }

    //
    // проверка существования директории
    //

    fsUtil.exists(pathToDir, function (exists)
    {
        if (!exists)
        {
            callback(['директория "' + pathToDir + '" не существует']);
            return;
        }

        $fs.stat(pathToDir, function (err, stat)
        {
            if (err)
            {
                callback(['произошла системная ошибка', err]);
                return;
            }

            if (!stat.isDirectory())
            {
                callback(['директория "' + pathToDir + '" не существует']);
                return;
            }

            requirePackages();
        });
    });

    //
    // подключение пакетов
    //

    function requirePackages ()
    {
        var pkgs = {},
            errors = [],
            loading = 1;

        $fs.readdir(pathToDir, function (err, files)
        {
            if (err)
            {
                errors = errors.concat(['не удалось подключить директорию "' + pathToDir + '"', err]);
                loading--;
                return;
            }

            //
            // обход директории
            //

            files.forEach(function (filename)
            {
                if (!(filename in params.exclude))
                {
                    loading++;

                    $fs.stat(pathToDir + '/' + filename, function (err, stat)
                    {
                        if (err)
                        {
                            errors = errors.concat(['не удалось подключить пакет "' + pathToDir + '/' + filename + '"', err]);
                            loading--;
                            return;
                        }

                        if (stat.isFile())
                        {
                            if ($path.extname(filename) !== '.js')
                            {
                                loading--;
                                return;
                            }

                            var name = $path.basename(filename, '.js');

                            pkgs[name] = require(pathToDir + '/' + name);
                        }

                        loading--;
                    });
                }
            });

            loading--;
        });

        //
        // ожидание загрузки пакетов
        //

        (function awaiting ()
        {
            nextTick(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                callback((errors.length ? errors : null), pkgs);
            });
        })();
    }
};

/**
 * Подключение пакетов из директории (sync)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 *
 * @return {Object}
 */
exports.requireDirSync = function requireDirSync (pathToDir, params)
{
    //
    // обработка входных параметров
    //

    pathToDir = $path.normalize(pathToDir);
    params = params || {};

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    else
    {
        params.exclude = {};
    }

    //
    // проверка существования директории
    //

    if (!fsUtil.existsSync(pathToDir) || !$fs.statSync(pathToDir).isDirectory())
    {
        return {};
    }

    //
    // подключение модулей
    //

    var pkgs = {};

    $fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (!(filename in params.exclude))
        {
            if (!$fs.lstatSync(pathToDir + '/' + filename).isFile() || $path.extname(filename) !== '.js')
            {
                return;
            }

            var name = $path.basename(filename, '.js');

            pkgs[name] = require(pathToDir + '/' + name);
        }
    });

    return pkgs;
};

/**
 * Рекурсивное подключение пакетов из директории (async)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 * @param {Function} callback
 */
exports.requireDirR = function requireDirR (pathToDir, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToDir = $path.normalize(pathToDir);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    else
    {
        params.exclude = {};
    }

    //
    // проверка существования директории
    //

    fsUtil.exists(pathToDir, function (exists)
    {
        if (!exists)
        {
            callback(['директория "' + pathToDir + '" не существует']);
            return;
        }

        $fs.stat(pathToDir, function (err, stat)
        {
            if (err)
            {
                callback(['произошла системная ошибка', err]);
                return;
            }

            if (!stat.isDirectory())
            {
                callback(['директория "' + pathToDir + '" не существует']);
                return;
            }

            requirePackages();
        });
    });

    //
    // подключение пакетов
    //

    function requirePackages ()
    {
        var pkgs = {},
            errors = [],
            loading = 0;

        //
        // рекурсивный обход директорий
        //

        (function bypass (pathToDir, path)
        {
            loading++;

            path = path ? path + '/' : '';

            $fs.readdir(pathToDir, function (err, files)
            {
                if (err)
                {
                    errors = errors.concat(['не удалось подключить директорию "' + pathToDir + '"', err]);
                    loading--;
                    return;
                }

                //
                // обход текущей директории
                //

                files.forEach(function (filename)
                {
                    if (!(filename in params.exclude))
                    {
                        loading++;

                        $fs.stat(pathToDir + '/' + filename, function (err, stat)
                        {
                            if (err)
                            {
                                errors = errors.concat(['не удалось подключить ресурс "' + pathToDir + '/' + filename + '"', err]);
                                loading--;
                                return;
                            }

                            if (stat.isDirectory())
                            {
                                bypass(pathToDir + '/' + filename, path + filename);
                                loading--;
                                return;
                            }

                            if ($path.extname(filename) !== '.js')
                            {
                                loading--;
                                return;
                            }

                            var name = $path.basename(filename, '.js');

                            pkgs[path + name] = require(pathToDir + '/' + name);

                            loading--;
                        });
                    }
                });

                loading--;
            });
        })(pathToDir);

        //
        // ожидание загрузки пакетов
        //

        (function awaiting ()
        {
            nextTick(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                callback((errors.length ? errors : null), pkgs);
            });
        })();
    }
};

/**
 * Рекурсивное подключение пакетов из директории (sync)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 *
 * @return {Object}
 */
exports.requireDirRSync = function requireDirRSync (pathToDir, params)
{
    //
    // обработка входных параметров
    //

    pathToDir = $path.normalize(pathToDir);
    params = params || {};

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    else
    {
        params.exclude = {};
    }

    //
    // проверка существования директории
    //

    if (!fsUtil.existsSync(pathToDir) || !$fs.statSync(pathToDir).isDirectory()) return {};

    //
    // рекурсивное подключение модулей
    //

    return (function bypass (pathToDir, pkgs, path)
    {
        pkgs = pkgs || {};
        path = path ? path + '/' : '';

        $fs.readdirSync(pathToDir).forEach(function (filename)
        {
            if (!(filename in params.exclude))
            {
                if ($fs.lstatSync(pathToDir + '/' + filename).isDirectory())
                {
                    bypass(pathToDir + '/' + filename, pkgs, path + filename);
                }
                else
                {
                    if ($path.extname(filename) !== '.js')
                    {
                        return;
                    }

                    var name = $path.basename(filename, '.js');

                    pkgs[path + name] = require(pathToDir + '/' + name);
                }
            }
        });

        return pkgs;
    })(pathToDir);
};