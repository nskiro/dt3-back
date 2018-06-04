const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/general/:folderName',(req, res, next) => {
    const folderArr = req.params.folderName.split('-');
    const tree = dirTree(`./upload/file/compliance/G/${folderArr[0]}/${folderArr[1]}`);
    res.status(200).send(tree.children);
});

router.get('/humidity/:folderName',(req, res, next) => {
    const tree = dirTree(`./upload/file/compliance/H/${req.params.folderName}`);
    res.status(200).send(tree.children);
});

router.get('/metal',(req, res, next) => {
    const tree = dirTree(`./upload/file/compliance/M`);
    res.status(200).send(tree.children);
});

module.exports = router;