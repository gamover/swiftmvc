/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 21.03.13
 * Time: 17:01
 */

var $typeUtil = require('./type');

exports.error = function (msg, srcMsgs)
{
    var error = [];

    if (!$typeUtil.isArray(srcMsgs)) srcMsgs = [srcMsgs];

    error.push(msg);
    error.push(srcMsgs);

    return error;
};

exports.log = function (errors)
{
    if (!$typeUtil.isArray(errors)) errors = [errors];

    (function log (errors, space)
    {
        errors.forEach(function (error)
        {
            if ($typeUtil.isArray(error))
            {
                log(error, space + '  ');
                return;
            }

            console.log(space, error);
        });
    })(errors, '');
};