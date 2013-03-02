/**
 * Author: G@mOBEP
 * Date: 02.03.13
 * Time: 12:06
 */

var _path = require('path'),

    __endvars__;

/**
 * Получение первого существующего пути из списка
 *
 * @param {Array} paths список путей
 *
 * @returns {String|null}
 */
exports.getExistingPath = function (paths)
{
    for (var i = 0, n = paths.length; i < n; i++)
    {
        var path = _path.normalize(paths[i]);

        if (_path.existsSync(path))
        {
            return path;
        }
    }

    return null;
};