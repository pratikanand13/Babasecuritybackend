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
    const getOwaspCategoryForCwe = require('../utils/cwetoOwasp')
    const mongoose = require('mongoose')
    const { ObjectId } = mongoose.Types;

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
            const data = req.body;  
            console.log('Incoming data:', data); 
        
            const organisationId = req.user._id; 
        
            // Check for required fields
            if (!data.name || !data.githublink || !data.livelink || !organisationId) {
                return res.status(400).send({
                    error: 'Missing required fields: name, githublink, livelink, or organisationId'
                });
            }
    
            // Ensure apis is an array
            if (!Array.isArray(data.apis)) {
                return res.status(400).send({ error: 'apis must be an array' });
            }
    
            // Prepare the apiName array with API URLs and empty records
            const apiName = data.apis.map(api => ({
                api: api.url,  // API URL
                records: []    // Empty array for records initially
            }));
    
            // Create a new entry for ApiStore
            const newEntry = new apiStore({
                apiName: apiName,
                name: data.name,
                githublink: data.githublink,
                livelink: data.livelink,
                organisationId: organisationId 
            });
    
            // Save the new entry
            const response = await newEntry.save();
            res.status(201).send(response); 
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
            const severityIssues = req.severityIssues;
            const githubLink = req.user.organisationgithuburl;  
            const githubOrgName = req.user.organisationname;  
    
            const history = await ScanResult.findOne({ githubOrgName });
    
            // if (!history) {
            //     return res.status(404).send("History not found for the organization");
            // }
    
            // console.log("History:", history);
    
            // const fixedIssues = [];
    
            // // Function to find fixed issues
            // const findFixedIssues = (previous, current) => {
            //     return [...previous].filter(issue => !current.has(issue));
            // };
    
            // // Processing CRITICAL issues
            // if (Array.isArray(history.CRITICAL) && Array.isArray(severityIssues['CRITICAL:'])) {
            //     const historyCriticalSet = new Set(history.CRITICAL);
            //     const severityCriticalSet = new Set(severityIssues['CRITICAL:']);
            //     fixedIssues.push(...findFixedIssues(historyCriticalSet, severityCriticalSet));
            // }
    
            // // Processing HIGH issues
            // if (Array.isArray(history.HIGH) && Array.isArray(severityIssues['HIGH:'])) {
            //     const historyHighSet = new Set(history.HIGH);
            //     const severityHighSet = new Set(severityIssues['HIGH:']);
            //     fixedIssues.push(...findFixedIssues(historyHighSet, severityHighSet));
            // }
    
            // // Processing MEDIUM issues
            // if (Array.isArray(history.MEDIUM) && Array.isArray(severityIssues['MEDIUM:'])) {
            //     const historyMediumSet = new Set(history.MEDIUM);
            //     const severityMediumSet = new Set(severityIssues['MEDIUM:']);
            //     fixedIssues.push(...findFixedIssues(historyMediumSet, severityMediumSet));
            // }
    
            // // Processing LOW issues
            // if (Array.isArray(history.LOW) && Array.isArray(severityIssues['LOW:'])) {
            //     const historyLowSet = new Set(history.LOW);
            //     const severityLowSet = new Set(severityIssues['LOW:']);
            //     fixedIssues.push(...findFixedIssues(historyLowSet, severityLowSet));
            // }
    
            // console.log("Fixed Issues:", fixedIssues);
    
            // Restructuring data to store in the database
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
    
            console.log("Restructured Data:", restructuredData);
    
            // Update or insert the scan result in the database
            await ScanResult.findOneAndUpdate(
                { githubLink },
                { $set: restructuredData },
                { new: true, upsert: true }
            );
    
            const apiResponse = {
                name: githubOrgName,
                CRITICAL: restructuredData.CRITICAL.join(', '),
                HIGH: restructuredData.HIGH.join(', '),
                MEDIUM: restructuredData.MEDIUM.join(', '),
                LOW: restructuredData.LOW.join(', '),
                termOut: req.termOut ,
                history : history
            };
    
            // Extract CWE codes using regex and map to OWASP categories
            const cweRegex = /CWE-\d{3}/g;
            const cweCodes = stdout.match(cweRegex) || [];
            const uniqueCweCodes = [...new Set(cweCodes)];
            console.log("Extracted CWE Codes:", uniqueCweCodes);
    
            let dataout = [];
            for (let i = 0; i < uniqueCweCodes.length; i++) {
                dataout.push(getOwaspCategoryForCwe(uniqueCweCodes[i]));
            }
    
            // Prepare the payload
            const payload = {
                name: githubOrgName,
                history: history,
                termOut: req.termOut,
                owaspData: dataout,
                CRITICAL: severityIssues['CRITICAL:'] || [],
                HIGH: severityIssues['HIGH:'] || [],
                MEDIUM: severityIssues['MEDIUM:'] || [],
                LOW: severityIssues['LOW:'] || []
            };
    
            // Clean up and send response
            await clearDir(githubOrgName);
            res.status(201).send({ payload });
    
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
    
    
    

    
    const Record = mongoose.model('Record', nucleiSchema);
    
    router.post('/nuclei', auth, lrnuclei, async (req, res) => {
        try {
            const { severity, tag, url } = req.body;
            const extractedIssues = req.extractedIssues.filter(issue => issue.trim() !== "")
            const terminal = req.terminalOut; 
            const normalizedUrl = url; 
            const payload = {
                name: req.stdout,
                terminalOut: terminal,
                extractedIssues:extractedIssues,
                url: normalizedUrl
            };
            res.status(201).send({ payload });
        } catch (e) {
            console.error("Caught error:", e);
            res.status(500).send({ error: "Internal Server Error" });
        }
    });
    
    
    
    module.exports = router;
