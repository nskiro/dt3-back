const express = require('express');
const dirTree = require('directory-tree');
const router = express.Router();

router.get('/listfolder',(req, res, next) => {
    const tree = dirTree(`./upload/file/embroidery`);
    res.status(200).send(tree.children);
});

module.exports = router;