    const { spawn } = require('child_process');
    const express = require('express');
    const router = express.Router();
    const dashboardSchema = require('../models/dashboardSchema');
    const apiStore = require('../models/apistore')
    const vulnapi = require('../middleware/vulnapi');
    const modifyTxt = require('../middleware/modifytxt')
    const webCrawling = require('../middleware/webCrawling');
    const storeLinksAndData = require('../utils/indentify')
    const logMiddleware = require('../middleware/logRequest')
    const auth = require('../middleware/dashboardAuth')
    const sastBearer = require('../middleware/sastBearer')
    const lrnuclei = require('../middleware/lrnuclei')
    const nucleiSchema = require('../models/nucleiSchema')
    const extract = require('../utils/extract')
    const ScanResult = require('../models/bearerSchema')
    const clearDir = require('../utils/clearDir')
    router.use(logMiddleware);
    router.post('/testapi', vulnapi,modifyTxt, async (req, res) => {
        try {
            response = req.headers['modifiedStdout']
            res.status(201).send(response);
        } catch (error) {
            console.error('Caught error:', error);
            res.status(403).send("Dashboard Down");
        }
    });
    router.post('/webcrawling', webCrawling, async (req, res) => {
        try {
            console.log(1)
            const data = req.stdout
            console.log("data",data)
            const review = storeLinksAndData(data)
            const link = await storeLinksAndData(data);
            console.log(link);

            const newEntry = new apiStore({
                links: link.links.links
            });

            const response = await newEntry.save();
            res.status(201).send(response);
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).send("Internal Server Error");
        }
    });
    router.get('/apilinks', async (req, res) => {
        try {
            const links = await apiStore.find();
            res.status(200).send(links);
        } catch (error) {
            console.error('Caught error fetching API links:', error);
            res.status(500).send("Internal Server Error");
        }
    });
    router.post('/bearer', sastBearer, async (req, res) => {
        try {
            const data = req.scanResults;
            const orgname = req.body.name;
            const restructuredData = {
                name: orgname,  
                CRITICAL: data["CRITICAL:"] || [],
                HIGH: data["HIGH:"] || [],
                MEDIUM: data["MEDIUM:"] || [],
                LOW: data["LOW:"] || []
            };
    
            console.log(restructuredData);
            const scanResult = new ScanResult(restructuredData);
            await scanResult.save();
            const apiResponse = {
                name: restructuredData.name,
                CRITICAL: restructuredData.CRITICAL.join(', '),
                HIGH: restructuredData.HIGH.join(', '),
                MEDIUM: restructuredData.MEDIUM.join(', '),
                LOW: restructuredData.LOW.join(', ')
            };
            await clearDir(orgname)
            res.status(201).send(req.dataCopy);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
    
    
    router.post('/nuclei', lrnuclei, async (req, res) => {
        try {
            const parsedStdout = req.stdout;
            const extractedIssues = req.extractedIssues;
            const { severity, tag } = req.body;
            const url = req.body.url;
            let urlDocument = await nucleiSchema.findOne({ url });
    
            if (!urlDocument) {
                urlDocument = new nucleiSchema({
                    url,
                    records: []
                });
            }
            extractedIssues.forEach(issue => {
                if (issue) { 
                    urlDocument.records.push({
                        name: issue, 
                        tag,
                        severity
                    });
                }
            });
    
            await urlDocument.save();
    
            res.status(201).send(req.fullcmd); 
        } catch (e) {
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    });
    module.exports = router;
