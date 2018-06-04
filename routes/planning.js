const express = require('express');
const fs = require('fs');
const dirTree = require('directory-tree');
const router = express.Router();
const _ = require('lodash');
const XLSX = require('xlsx');

router.get('/production',(req,res,next) => {
    const tree = dirTree(`./upload/file/plan/P`);
    res.status(200).send(tree.children);
});

router.get('/production/:fileName',(req,res,next) => {
    const workbook = XLSX.readFile(`./upload/file/plan/P/${req.params.fileName}`);
    const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(first_worksheet);
    const newData = data.map((obj) => {
        return _.mapKeys(obj, (v, k) => _.camelCase(k));
    });
    /*res.status(200).send(_.remove(newData,(obj)=>{
        return obj.hasOwnProperty('sku') && obj.sku !== "";
    }));*/
    res.status(200).send(newData);
});

router.get('/booking',(req,res,next) => {
    const tree = dirTree(`./upload/file/plan/B`);
    res.status(200).send(tree.children);
});

router.get('/shipping',(req,res,next) => {
    const tree = dirTree(`./upload/file/plan/S`);
    res.status(200).send(tree.children);
});

router.get('/embroidery',(req,res,next) => {
    const tree = dirTree(`./upload/file/plan/E`);
    res.status(200).send(tree.children);
});

router.get('/deleteFile/:fileName', (req,res,next) => {
    const fileType = req.params.fileName.split('-');
    let filePath = './upload/file/plan/'
    switch(fileType[0]){
        case 'B':
            filePath += 'B/';
            break;
        case 'S':
            filePath += 'S/';
            break;
    }
    fs.unlink(filePath + req.params.fileName, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send('File was deleted');
    });
});

module.exports = router;