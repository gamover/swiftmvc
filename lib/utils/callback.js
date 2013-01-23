/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 17:52
 */

module.exports = function (callback)
{
    if (typeof callback !== 'function')
    {
        callback = function ()
        {
            return;
        };
    }

    return callback;
};