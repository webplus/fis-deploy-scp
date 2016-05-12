/*
* author: wanglin576
* date: 2016-05-10
* desc: 将输出打包成zip包,并scp到远程机
* from https://github.com/webplus/fis-deploy-scp
*/
var fs = require('fs');
var archive = require('archiver')('zip');
var cwd = process.cwd();
var path = require("path");
var child_process = require("child_process");

function normalizePath(to, root){
    if (!to){
        to = '/';
    }else if(to[0] === '.'){
        to = fis.util(cwd + '/' +  to);
    } else if(/^output\b/.test(to)){
        to = fis.util(root + '/' +  to);
    }else {
        to = fis.util(to);
    }
    return to;
}

function upload (conf) {
    if (!conf.to) {
        throw new Error('options.to is required!');
    } else if (!conf.file) {
        throw new Error('options.source is required!');
    }
    var zipfile = conf.file.split('/').pop();
    var scp_cmd = "scp " + conf.file + " " + conf.server + ":" + conf.to;
    var unzip_cmd = "ssh " + conf.server + " \"cd " + conf.to + ";unzip -o " + zipfile + ";rm -rf "+ zipfile +";exit;\"";

    child_process.exec(scp_cmd, function(e1, p1) {
        if (e1) {
            console.log(e1);
        } else {
            console.log(scp_cmd + "\n");
            console.log("Upload complete.")
        }
        child_process.exec(unzip_cmd, function(e2, p2) {
            if (e2) {
                console.log(e2);
            } else {
                console.log("Remote deployment complete.")
            }
        })
    })
}

module.exports = function(files, settings, callback) {
    var conf = settings, targetPath, output;
    if (!conf.file){
        fis.log.error('[fis-deploy-scp] need specify the zip file path with option [file]')
    }
    targetPath = normalizePath(conf.file, fis.project.getProjectPath());
    if (!fis.util.exists(targetPath)) {
        fis.util.mkdir(fis.util.pathinfo(targetPath).dirname);
    }
    output = fs.createWriteStream(targetPath);
    archive.pipe(output);
    files.forEach(function(fileInfo){
        var file = fileInfo.file;
        if(!file.release){
            fis.log.error('unable to get release path of file['
                + file.realpath
                + ']: Maybe this file is neither in current project or releasable');
        }
        var name = (('/') + fileInfo.dest.release).replace(/^\/*/g, '');
        if (!/map\.json/.test(name)) {
            archive.append(fileInfo.content, {name: name});
        }
    });
    output.on('close', function(){
        fis.log.debug('[fis-deploy-scp] zip end');
        upload(conf)
        callback && callback();
    });
    archive.finalize();
}
module.exports.fullpack = true;