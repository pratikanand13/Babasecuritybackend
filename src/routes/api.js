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
    const apistore = require('../models/apistore')
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
    router.post('/apiDiscovery', auth, async (req, res) => {
        try {
            console.log('Request received');
            
            // Extract data from request body
            const data = req.body;  // Assuming data is coming from req.body
            console.log('Incoming data:', data);  // Log incoming data for debugging
    
            const organisationId = req.user._id;  // Assuming organisationId comes from the authenticated user
    
            if (!data.name || !data.githublink || !data.livelink || !organisationId) {
                return res.status(400).send({
                    error: 'Missing required fields: name, githublink, livelink, or organisationId'
                });
            }
    
            // Validate that apis is an array
            if (!Array.isArray(data.apis)) {
                return res.status(400).send({ error: 'apis must be an array' });
            }
    
            // Create a new entry in the ApiStore
            const newEntry = new apiStore({
                apiName: data.apis,  // Assign the apis array to apiName
                name: data.name,
                githublink: data.githublink,
                livelink: data.livelink,
                organisationId: organisationId  // Use the authenticated user's organisationId
            });
    
            // Save the entry to the database
            const response = await newEntry.save();
            res.status(201).send(response);  // Return the saved document as the response
        } catch (error) {
            console.error('Caught error:', error);
            res.status(500).send({ error: "Internal Server Error" });
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
    router.get('/bearer', auth, sastBearer, async (req, res) => {
        try {
            const stdout = req.stdout;  
            const severityIssues = req.scanResults
            console.log("seveirtyissue",severityIssues['HIGH:'])
            const githubOrgName = req.user.organisationname;  
            const githubLink = req.user.organisationgithuburl;  
            const uid = req.user._id;
    
            const restructuredData = {
                organisationId: uid,
                githubOrgName: githubOrgName,  
                githubLink: githubLink,  
                CRITICAL: severityIssues['CRITICAL:'] || [],  
                HIGH: severityIssues['HIGH:'] || [],  
                MEDIUM: severityIssues['MEDIUM:'] || [], 
                LOW: severityIssues['LOW:'] || []  
            };
            console.log(restructuredData);
            const scanResult = new ScanResult(restructuredData);
            await scanResult.save();
            const apiResponse = {
                name: githubOrgName,
                CRITICAL: restructuredData.CRITICAL.join(', '),
                HIGH: restructuredData.HIGH.join(', '),
                MEDIUM: restructuredData.MEDIUM.join(', '),
                LOW: restructuredData.LOW.join(', ')
            };
    
            await clearDir(githubOrgName);
            res.status(201).send(apiResponse);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
    
    
    
    router.post('/nuclei',auth, lrnuclei, async (req, res) => {
        try {
            const parsedStdout = req.stdout;
        const extractedIssues = req.extractedIssues; // This is an array
        const { severity, tag } = req.body;
        const url = req.body.url;
        let urlDocument = await nucleiSchema.findOne({ url });

        if (!urlDocument) {
            // If no document is found, create a new one
            urlDocument = new nucleiSchema({
                url,
                records: []
            });
        }

        // Iterate over each issue in the extractedIssues array and add it to the document
        extractedIssues.forEach(issue => {
            if (issue) { // Only add if issue is not an empty string
                urlDocument.records.push({
                    name: issue, // Using the issue as the name
                    tag,
                    severity
                });
            }
        });

        await urlDocument.save();
        res.status(201).send(extractedIssues)
        } catch (e) {
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    });
    module.exports = router;
