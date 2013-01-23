/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 24.12.12
 * Time: 14:46
 */

var _path = require('path'),

    LIB_PATH = _path.resolve(__dirname),
    SWIFT_PATH = _path.resolve(LIB_PATH + '/..');

module.exports = exports = {
    path: {
        lib: LIB_PATH,
        swift: SWIFT_PATH
    }
};