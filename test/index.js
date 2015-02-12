'use strict';

/**
 * Require all sub dirs and sub files
 **/
var fs      = require('fs');
var path    = require('path');

require_dir(__dirname);

function require_dir(dirname){
    var subdirs = fs.readdirSync(dirname);
    subdirs.forEach(function(subpath){
        var subpath = path.join(dirname, subpath);
        if(subpath == __filename) return;
        var stat = fs.statSync(subpath);
        if(stat.isFile() && '.js' == path.extname(subpath).toLowerCase()){
            return require(subpath);
        }
        if(stat.isDirectory()) return require_dir(subpath);
    });
}
