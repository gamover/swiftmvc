/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 13.02.13
 * Time: 12:12
 */

var __configurator = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),

    _endvars_;

__configurator.Configurator = function ()
{
    var self = this,

        env = process.env.NODE_ENV || 'development',
        pathToSysConfig,
        pathToAppConfig,

        sysConfig,
        appConfig,
        config = {};

    /**
     * Задание пути к системному файлу конфигурации
     *
     * @param {String} path
     *
     * @returns {Configurator}
     */
    self.setPathToSysConfig = function (path)
    {
        pathToSysConfig = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к системному файлу конфигурации
     *
     * @returns {Configurator}
     */
    self.getPathToSysConfig = function ()
    {
        return pathToSysConfig;
    };

    /**
     * Задание пути к файлу конфигурации
     *
     * @param {String} path
     *
     * @returns {Configurator}
     */
    self.setPathToAppConfig = function (path)
    {
        pathToAppConfig = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к файлу конфигурации
     *
     * @returns {Configurator}
     */
    self.getPathToAppConfig = function ()
    {
        return pathToAppConfig;
    };

    /**
     * Компиляция конфигурации
     *
     * @returns {Configurator}
     */
    self.compile = function ()
    {
        if (pathToSysConfig && _path.existsSync(pathToSysConfig) && _fs.statSync(pathToSysConfig).isFile() && _path.extname(pathToSysConfig) === '.json')
        {
            sysConfig = JSON.parse(_fs.readFileSync(pathToSysConfig, 'UTF-8'));
        }

        if (pathToAppConfig && _path.existsSync(pathToAppConfig) && _fs.statSync(pathToAppConfig).isFile() && _path.extname(pathToAppConfig) === '.json')
        {
            appConfig = JSON.parse(_fs.readFileSync(pathToAppConfig, 'UTF-8'));
        }

        if (!sysConfig && !appConfig)
        {
            return self;
        }
        else if (!sysConfig)
        {
            config = appConfig[env] || {};
            return self;
        }
        else if (!appConfig)
        {
            config = sysConfig[env] || {};
            return self;
        }

        config = self.complete(self.extend(appConfig), self.extend(sysConfig));

        config.path = typeof config.path === 'object' ? config.path : {};
        config.path.project = config.path.project || _path.normalize(_path.dirname(pathToAppConfig) + '/../..');
        config.path.app = config.path.app || config.path.project + '/app';
        config.path.modules = config.path.modules || config.path.app + '/modules';
        config.path.config = _path.dirname(pathToAppConfig);
        config.path.swift = _path.resolve(__dirname + '/..');
        config.path.lib = _path.resolve(__dirname);

        return self;
    };

    /**
     * Наследование namespace
     *
     * @param {Object} config
     *
     * @returns {Object}
     */
    self.extend = function (config)
    {
        var nsConfig = config[env] || config['development'] || config['production'] || {},
            extConfig = {};

        while (nsConfig)
        {
            (function extendConfig (extConfig, nsConfig)
            {
                for (var key in nsConfig)
                {
                    if (typeof nsConfig[key] !== 'object')
                    {
                        extConfig[key] = extConfig[key] || nsConfig[key];
                    }
                    else
                    {
                        extConfig[key] = extConfig[key] || {};

                        if (typeof extConfig[key] === 'object')
                        {
                            extendConfig(extConfig[key], nsConfig[key]);
                        }
                    }
                }
            })(extConfig, nsConfig);

            nsConfig = config[nsConfig.$extends];
        }

        delete extConfig.$extends;

        return  extConfig;
    };

    /**
     * Дополнение общей конфигурации
     *
     * @param {Object} config1 дополняемая конфигурация
     * @param {Object} config2 дополняющая конфигурация
     *
     * @returns {Object} дополненная конфигурация
     */
    self.complete = function (config1, config2)
    {
        (function completeConfig (config1, config2)
        {
            for (var key in config2)
            {
                if (typeof config2[key] !== 'object')
                {
                    config1[key] = config1[key] || config2[key];
                }
                else
                {
                    config1[key] = config1[key] || {};

                    if (typeof config1[key] === 'object')
                    {
                        completeConfig(config1[key], config2[key]);
                    }
                }
            }
        })(config1, config2);

        return config1;
    };

    /**
     * Получение конфигурации
     *
     * @returns {Object}
     */
    self.getConfig = function ()
    {
        return config;
    };
};