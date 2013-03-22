/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 21.03.13
 * Time: 17:20
 */

var $typeUtil = require('../utils/type');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = SwiftError;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SwiftError (code, message, more)
{
    this._code = null;
    this._message = null;
    this._more = [];

    if (typeof code === 'string')
    {
        more = message;
        message = code;
    }

    if (typeof code === 'number') this._code = code;
    if (typeof message === 'string') this._message = message;
    if (typeof more !== 'undefined' && more !== null)
    {
        if ($typeUtil.isArray(more)) this._more = more;
        else this._more = [more];
    }
}

SwiftError.prototype.getCode = function ()
{
    return this._code;
};

SwiftError.prototype.getMessage = function ()
{
    return this._message;
};

SwiftError.prototype.getMore = function ()
{
    return this._more;
};

SwiftError.prototype.log = function ()
{
    console.log(this._message);

    if (this._more !== null) log(this._more);

    function log (errors, space)
    {
        if (typeof space === 'undefined') space = ' ';

        errors.forEach(function (error)
        {
            if ($typeUtil.isArray(error))
            {
                log(error, space + '  ');
                return;
            }

            console.log(space, error);
        });
    }

    return this;
};

