/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 0:16
 */

exports.ucfirst = function (str)
{
    var first = str.charAt(0).toUpperCase();
    return first + str.substr(1);
};