var util = require('util');

exports.imageForm = function(req, res) {
    res.render('upload', {
        title: 'Upload Images'
    });
};

exports.uploadImage = function(req, res, next){
        console.log('file info: ',req.files.image);

        res.render("thanks");
};
