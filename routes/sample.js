const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/listfolder/:folderName',(req, res, next) => {
    const tree = dirTree(`./upload/file/sample/${req.params.folderName}`);
    res.status(200).send(tree.children);
});

module.exports = router;