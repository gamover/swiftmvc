/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 *
 * Работа с пакетами node.js
 */

var __package = module.exports = exports,

    _fs = require('fs'),
    _path = require('path');

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
__package.require = function (pathToSource, params, callback)
{
    setTimeout(function ()
    {
        //
        // обработка входных параметров
        //

        pathToSource = _path.normalize(pathToSource);

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

        _path.exists(pathToSource, function (exists)
        {
            if (!exists)
            {
                pathToSource += '.js';
                _path.exists(pathToSource, function (exists)
                {
                    if (!exists)
                    {
                        callback();
                        return;
                    }

                    _fs.stat(pathToSource, function (err, stats)
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
            _fs.stat(pathToSource, function (err, stats)
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
    }, 0);
};

/**
 * Подключение ресурса (sync)
 *
 * @param {String} pathToSource путь к ресурсу
 * @param {Object} params параметры
 *
 * @returns {*}
 */
__package.requireSync = function (pathToSource, params)
{
    //
    // обработка входных параметров
    //

    pathToSource = _path.normalize(pathToSource);
    params = params || {};

    //
    // проверка на существование ресурса
    //

    if (!_path.existsSync(pathToSource))
    {
        pathToSource += '.js';
        if (!_path.existsSync(pathToSource) || !_fs.statSync(pathToSource).isFile())
        {
            return;
        }
    }

    //
    // подключение ресурса
    //

    if (_fs.statSync(pathToSource).isDirectory())
    {
        return __package.requireDirRSync(pathToSource, params);
    }

    return require(pathToSource);
};

/**
 * Подключение пакетов из директории (async)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object|Function} params параметры
 * @param {Function} callback
 */
__package.requireDir = function (pathToDir, params, callback)
{
    setTimeout(function ()
    {
        //
        // обработка входных параметров
        //

        pathToDir = _path.normalize(pathToDir);

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

        _path.exists(pathToDir, function (exists)
        {
            if (!exists)
            {
                callback(['директория "' + pathToDir + '" не существует']);
                return;
            }

            _fs.stat(pathToDir, function (err, stat)
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

            _fs.readdir(pathToDir, function (err, files)
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

                        _fs.stat(pathToDir + '/' + filename, function (err, stat)
                        {
                            if (err)
                            {
                                errors = errors.concat(['не удалось подключить пакет "' + pathToDir + '/' + filename + '"', err]);
                                loading--;
                                return;
                            }

                            if (stat.isFile())
                            {
                                if (_path.extname(filename) !== '.js')
                                {
                                    loading--;
                                    return;
                                }

                                var name = _path.basename(filename, '.js');

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
                setTimeout(function ()
                {
                    if (loading)
                    {
                        awaiting();
                        return;
                    }

                    callback((errors.length ? errors : null), pkgs);
                }, 0);
            })();
        }
    }, 0);
};

/**
 * Подключение пакетов из директории (sync)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 *
 * @return {Object}
 */
__package.requireDirSync = function (pathToDir, params)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.normalize(pathToDir);
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

    if (!_path.existsSync(pathToDir) || !_fs.statSync(pathToDir).isDirectory())
    {
        return {};
    }

    //
    // подключение модулей
    //

    var pkgs = {};

    _fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (!(filename in params.exclude))
        {
            if (!_fs.lstatSync(pathToDir + '/' + filename).isFile() || _path.extname(filename) !== '.js')
            {
                return;
            }

            var name = _path.basename(filename, '.js');

            pkgs[name] = require(pathToDir + '/' + name);
        }
    });

    return pkgs;
};

/**
 * Рекурсивное подключение пакетов из директории (async)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object|Function} params параметры
 * @param {Function} callback
 */
__package.requireDirR = function (pathToDir, params, callback)
{
    setTimeout(function()
    {
        //
        // обработка входных параметров
        //

        pathToDir = _path.normalize(pathToDir);

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

        _path.exists(pathToDir, function (exists)
        {
            if (!exists)
            {
                callback(['директория "' + pathToDir + '" не существует']);
                return;
            }

            _fs.stat(pathToDir, function (err, stat)
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

                _fs.readdir(pathToDir, function (err, files)
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

                            _fs.stat(pathToDir + '/' + filename, function (err, stat)
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

                                if (_path.extname(filename) !== '.js')
                                {
                                    loading--;
                                    return;
                                }

                                var name = _path.basename(filename, '.js');

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
                setTimeout(function ()
                {
                    if (loading)
                    {
                        awaiting();
                        return;
                    }

                    callback((errors.length ? errors : null), pkgs);
                }, 0);
            })();
        }
    }, 0)
};

/**
 * Рекурсивное подключение пакетов из директории (sync)
 *
 * @param {String} pathToDir путь к директории
 * @param {Object} params параметры
 *
 * @return {Object}
 */
__package.requireDirRSync = function (pathToDir, params)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.normalize(pathToDir);
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

    if (!_path.existsSync(pathToDir) || !_fs.statSync(pathToDir).isDirectory())
    {
        return {};
    }

    //
    // рекурсивное подключение модулей
    //

    return (function bypass (pathToDir, pkgs, path)
    {
        pkgs = pkgs || {};
        path = path ? path + '/' : '';

        _fs.readdirSync(pathToDir).forEach(function (filename)
        {
            if (!(filename in params.exclude))
            {
                if (_fs.lstatSync(pathToDir + '/' + filename).isDirectory())
                {
                    bypass(pathToDir + '/' + filename, pkgs, path + filename);
                }
                else
                {
                    if (_path.extname(filename) !== '.js')
                    {
                        return;
                    }

                    var name = _path.basename(filename, '.js');

                    pkgs[path + name] = require(pathToDir + '/' + name);
                }
            }
        });

        return pkgs;
    })(pathToDir);
};