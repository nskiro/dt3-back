const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const _ = require('lodash');

// const productionPlanning = require('../Schema/ProductionPlanning');

router.post('/planning',(req, res, next) => {
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.planningFile;
    const fileNameArr = sampleFile.name.split('-');
    const filePath = `./upload/file/plan/${fileNameArr[0]}/${sampleFile.name}`;
    sampleFile.mv(filePath, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            /*const workbook = XLSX.readFile(filePath);
            const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(first_worksheet);
            const newData = data.map((obj) => {
                return _.mapKeys(obj, (v, k) => _.camelCase(k));
            });
            switch(fileNameArr[0]){
                case 'P':
                    productionPlanning.create(newData,(err,planning)=>{
                        if (err) return res.status(500).send(err.message);
                        res.status(200).send("File was uploaded and inserted to database successfully");
                    });
                    break;
            }*/
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/qa',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.qaFile;
    const fileNameArr = sampleFile.name.split("-");
    let filePath = '';
    if(fileNameArr[0] === 'QC1'){
        filePath = `./upload/file/qaqc/${fileNameArr[0]}/${fileNameArr[1]}/${sampleFile.name}`;
    }
    else{
        filePath = `./upload/file/qaqc/${fileNameArr[0]}/${sampleFile.name}`;
    }
    sampleFile.mv(filePath, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/marker',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.markerFile;
    const fileNameArr = sampleFile.name.split("-");
    sampleFile.mv(`./upload/file/marker/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/sample',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.sampleFile;
    const fileNameArr = sampleFile.name.split("-");
    sampleFile.mv(`./upload/file/sample/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/cutting',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.cuttingFile;
    sampleFile.mv(`./upload/file/cutting/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/numbering',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.numberingFile;
    sampleFile.mv(`./upload/file/numbering/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/production',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.productionFile;
    const fileNameArr = sampleFile.name.split("-");
    sampleFile.mv(`./upload/file/production/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/embroidery',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.embroideryFile;
    sampleFile.mv(`./upload/file/embroidery/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/packaging',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.packagingFile;
    const arrFileName = sampleFile.name.split('-');
    sampleFile.mv(`./upload/file/packaging/${arrFileName[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/fabricqc',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.fabricQcFile;
    const fileNameArr = sampleFile.name.split("-");
    sampleFile.mv(`./upload/file/fabricqc/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/compliance',(req, res, next) => {
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.complianceFile;
    const fileNameArr = sampleFile.name.split('-');
    let filePath = `./upload/file/compliance/${fileNameArr[0]}/${sampleFile.name}`;
    if(fileNameArr[0] === 'G'){
        filePath = `./upload/file/compliance/${fileNameArr[0]}/${fileNameArr[1]}/${fileNameArr[2]}/${sampleFile.name}`;
        //compliance/G/DT1/F
    }
    sampleFile.mv(filePath, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/trim',(req, res, next) => {
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.trimFile;
    const fileNameArr = sampleFile.name.split('-');
    let filePath = `./upload/file/trim/${fileNameArr[0]}/${sampleFile.name}`;
    if(fileNameArr[0] === 'TQ'){
        filePath = `./upload/file/trim/${fileNameArr[0]}/${fileNameArr[1]}/${sampleFile.name}`;
    }
    sampleFile.mv(filePath, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/administration',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.administrationFile;
    const fileNameArr = sampleFile.name.split('-');
    sampleFile.mv(`./upload/file/administration/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/aql',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.aqlFile;
    sampleFile.mv(`./upload/file/aql/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/sewingplan',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.sewingplanFile;
    sampleFile.mv(`./upload/file/sewingplan/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

router.post('/imex',(req,res,next)=>{
    if (!req.files)
        return res.status(500).send('No files were uploaded');
    const sampleFile = req.files.markerFile;
    const fileNameArr = sampleFile.name.split("-");
    sampleFile.mv(`./upload/file/imex/${fileNameArr[0]}/${sampleFile.name}`, function(err) {
        if (err)
            switch(typeof err){
                case 'object':
                    res.status(500).send(err.code);
                    break;
                default:
                    res.status(500).send(err);
                    break;
            }
        else{
            
            res.status(200).send("File was uploaded successfully");
        }
    });
});

module.exports = router;
