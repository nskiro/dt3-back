const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/listfolder/:folderName',(req, res, next) => {    
    const folderNameArr = req.params.folderName.split('-');
    let folderPath = '';
    if(folderNameArr[0] === "QC1"){
        folderPath = `./upload/file/qaqc/${folderNameArr[0]}/${folderNameArr[1]}`;
    }
    else{
        folderPath = `./upload/file/qaqc/${folderNameArr[0]}`;
    }
    const tree = dirTree(folderPath);
    res.status(200).send(tree.children);
});

module.exports = router;