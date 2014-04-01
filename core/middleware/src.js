var fs = require('fs'),
        ejs = require('ejs'),
        getHeaderAndFooter = require('../headerFooter').getHeaderAndFooter;

var userTemplatesDir = __dirname + "/../../user/views/",
        coreTemplatesDir = __dirname + "/../views/";


/*
* check if requested file is *.src and render
* */
exports.process = function (req, res, next) {
    // get the physical path of a requested file
    var realPath = global.app.get('specs path') + req.url;

    // get the dir of a requested file
    var directory = realPath.split("/");

    // get the filename of a requested file
    var filename = directory.splice(directory.length - 1, 1)[0];
    directory = directory.join("/");

    // get the extension of a requested file
    var extension = filename.split(".");
    extension = (extension.length - 1) ? extension[extension.length - 1] : "";

    var infoJson = directory + '/info.json';

    if (extension == "src") {
        fs.exists(realPath, function(exists) {

            if (exists) {
                fs.readFile(realPath, 'utf8', function (err, data) {
                    if (err) {
                        res.send(err);
                    } else {

                        var info = {
                            title: "New spec",
                            author: "Anonymous",
                            keywords: ""
                        };

                        if (fs.existsSync(infoJson)) {
                            info = require(infoJson);
                        }

                        var headerFooterHTML = getHeaderAndFooter();

                        var template;

                        if (info.role === 'navigation') {
                            if (fs.existsSync(userTemplatesDir + "navigation.ejs")) {
                                template = fs.readFileSync(userTemplatesDir + "navigation.ejs", "utf-8");
                            } else {
                                template = fs.readFileSync(coreTemplatesDir + "navigation.ejs", "utf-8");
                            }
                        } else {
                            if (fs.existsSync(userTemplatesDir + "spec.ejs")) {
                                template = fs.readFileSync(userTemplatesDir + "spec.ejs", "utf-8");
                            } else {
                                template = fs.readFileSync(coreTemplatesDir + "spec.ejs", "utf-8");
                            }
                        }

                        var templateJSON = {
                            content: data,
                            header: headerFooterHTML.header,
                            footer: headerFooterHTML.footer
                        };

                        templateJSON.title = info.title ? info.title : "New spec";
                        templateJSON.author = info.author ? info.author : "Anonymous";
                        templateJSON.keywords = info.keywords ? info.keywords : "";

                        var html = ejs.render(template, templateJSON);

                        res.send(html);
                    }

                });

            } else {
                next();
            }
        });
    } else {
        console.log("%s NOT SRC, proceeding...", extension);
        next();
    }
};