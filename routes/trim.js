const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/input',(req, res, next) => {
    const tree = dirTree(`./upload/file/trim/TI`);
    res.status(200).send(tree.children);
});

router.get('/qa/:folderName',(req, res, next) => {
    const tree = dirTree(`./upload/file/trim/TQ/${req.params.folderName}`);
    res.status(200).send(tree.children);
});

module.exports = router;