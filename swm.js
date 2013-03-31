/**
 * Author: G@mOBEP
 * Date: 29.01.13
 * Time: 20:31
 */

var Dbuilder = require('dbuilder').Dbuilder,

    execDirPath = process.env.PWD,
    args = process.argv.slice(2),
    command = args[0],

    struct = require('./swm/startProject/structure');

if (command === 'startProject')
{
    var dbuilder = new Dbuilder();

    dbuilder
        .setTemplatesPath(__dirname + '/swm/startProject/templates')
        .setDestination(execDirPath)
        .setStruct(struct)
        .build()
    ;
}