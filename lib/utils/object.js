/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 12:17
 */

/**
 * Копирование объектов
 *
 * @param obj1
 * @param obj2
 *
 * @return {{}}
 */
exports.copy = function (obj1, obj2)
{
    if (typeof obj2 !== 'undefined')
    {
        for (var attr in obj2)
        {
            obj1[attr] = obj2[attr];
        }

        return obj1;
    }
    else
    {
        var newObj = {};
        for (var key in obj1)
        {
            newObj[key] = obj1[key];
        }

        return newObj;
    }
};

/**
 * Очистка объекта
 *
 * @param obj
 *
 * @return {*}
 */
exports.clear = function (obj)
{
    for (var key in obj)
    {
        delete obj[key];
    }

    return obj;
};