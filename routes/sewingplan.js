const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/listfolder',(req, res, next) => {
    const tree = dirTree(`./upload/file/sewingplan`);
    res.status(200).send(tree.children);
});

module.exports = router;