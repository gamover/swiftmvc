/**
 * Author: G@mOBEP
 * Date: 29.01.13
 * Time: 20:31
 */

var _fs = require('fs'),
    _path = require('path'),

    execDirPath = global.process.env.PWD,
    args = global.process.argv.slice(2),
    command = args[0];

if (command === 'startProject')
{
    var dbuilder = new (require('dbuilder').Dbuilder)();

    dbuilder
        .setTemplatesPath(__dirname + '/swm/startProject/templates')
        .setDestination(execDirPath)
        .setStructure(JSON.parse(_fs.readFileSync(__dirname + '/swm/startProject/structure.json', 'UTF-8')))
        .build()
    ;
}