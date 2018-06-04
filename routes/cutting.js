const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();
const XLSX = require('xlsx');
const _ = require('lodash');

router.get('/listfolder',(req, res, next) => {
    const tree = dirTree(`./upload/file/cutting`);
    res.status(200).send(tree.children);
});

router.get('/:fileName',(req, res, next) => {
    const workbook = XLSX.readFile(`./upload/file/cutting/${req.params.fileName}`);
    const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(first_worksheet);
    const newData = data.map((obj) => {
        return _.mapKeys(obj, (v, k) => _.camelCase(k));
    });
    res.status(200).send(_.remove(newData,(obj)=>{
        return obj.hasOwnProperty('sku') && obj.sku !== "";
    }));
})

module.exports = router;