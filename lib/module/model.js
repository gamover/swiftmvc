/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Модель Swift.
 */

var __model = module.exports = exports,

    countModels = 0;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__model.Model = function ()
{
    countModels++;

    var self = this,

        modelName = 'SwiftModel' + countModels;

    /**
     * Задание названия модели
     *
     * @param {string} name
     *
     * @returns {Model}
     */
    self.setName = function (name)
    {
        modelName = name;

        return self;
    };

    /**
     * Получение названия модели
     *
     * @returns {string}
     */
    self.getName = function ()
    {
        return modelName;
    };
};

/**
 * Получение кол-ва созданных моделей
 *
 * @returns {number}
 */
__model.getCountModels = function ()
{
    return countModels;
};