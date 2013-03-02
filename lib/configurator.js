/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 13.02.13
 * Time: 12:12
 */

module.exports = Configurator;

function Configurator ()
{
    var self = this,

        env = process.env.NODE_ENV || 'development',

        config = {};

    /**
     * Компиляция конфигурации
     *
     * @returns {Configurator}
     */
    self.compile = function (configSrc)
    {
        config = self.extend(configSrc);

        return self;
    };

    /**
     * Наследование namespace конфигурации
     *
     * @param {Object} configSrc исходная конфигурация
     *
     * @returns {Object}
     */
    self.extend = function (configSrc)
    {
        var nsPart = configSrc[env] || configSrc['development'] || configSrc['production'] || {},
            config = {};

        while (nsPart)
        {
            (function extendConfig (config, nsPart)
            {
                for (var key in nsPart)
                {
                    if (typeof nsPart[key] !== 'object' || (nsPart[key] instanceof Array))
                    {
                        config[key] = config[key] || nsPart[key];
                    }
                    else
                    {
                        config[key] = config[key] || {};

                        if (typeof config[key] === 'object' && !(config[key] instanceof Array))
                        {
                            extendConfig(config[key], nsPart[key]);
                        }
                    }
                }
            })(config, nsPart);

            nsPart = configSrc[nsPart.$extends];
        }

        delete config.$extends;

        return config;
    };

    /**
     * Дополнение конфигурации
     *
     * @param {Object} supConfig дополняющая конфигурация
     *
     * @returns {Configurator}
     */
    self.complete = function (supConfig)
    {
        (function complete (config, supConfig)
        {
            for (var key in supConfig)
            {
                if (typeof supConfig[key] !== 'object' || (supConfig[key] instanceof Array))
                {
                    config[key] = config[key] || supConfig[key];
                }
                else
                {
                    config[key] = config[key] || {};

                    if (typeof config[key] === 'object' && !(config[key] instanceof Array))
                    {
                        complete(config[key], supConfig[key]);
                    }
                }
            }
        })(config, supConfig);

        return self;
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
}