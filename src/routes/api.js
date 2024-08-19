const { spawn } = require('child_process');
const express = require('express');
const router = express.Router();
const dashboardSchema = require('../models/dashboardSchema');
const apiStore = require('../models/apistore');
const vulnapi = require('../middleware/vulnapi');
const modifyTxt = require('../middleware/modifytxt');
const webCrawling = require('../middleware/webCrawling');
const storeLinksAndData = require('../utils/indentify');
const logMiddleware = require('../middleware/logRequest');
const auth = require('../middleware/dashboardAuth');
const sastBearer = require('../middleware/sastBearer');
const lrnuclei = require('../middleware/lrnuclei');
const nucleiSchema = require('../models/nucleiSchema');
const extract = require('../utils/extract');
const ScanResult = require('../models/bearerSchema');
const clearDir = require('../utils/clearDir');
const getOwaspCategoryForCwe = require('../utils/cwetoOwasp');
const mongoose = require('mongoose');
const sastThird = require('../middleware/thirdpartysas');
let pie = require('../utils/pie');
let loadData = require('../public/api.json');

router.use(logMiddleware);

router.post('/testapi', vulnapi, modifyTxt, async (req, res) => {
    try {
        const response = req.headers['modifiedStdout'];
        res.status(201).send(response);
    } catch (error) {
        console.error('Caught error:', error);
        res.status(403).send("Dashboard Down");
    }
});

router.get('/apiDiscovery', auth,webCrawling, async (req, res) => {
    try {
        console.log('Request received');
        const data = req.apis;
        const emailValue = req.user.email;
        const organisationId = req.user._id;

        console.log('Incoming data:', data);
        let pieData = pie(loadData);
        const payload = {
            apis: data,  
            organisationId: organisationId,
            responseCodesPerEndpoint: pieData.accessCountsPerEndpoint,
            reqReceived: pieData.accessCountsPerEndpoint
        };

        // Send the response with the payload
        return res.status(200).send(payload);

    } catch (error) {
        console.error('Caught error:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
}); 

router.get('/apilinks', auth, async (req, res) => {
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
        console.log('1');
        const stdout = req.stdout;
        const severityIssues = req.severityIssues;
        const githubLink = req.user.organisationgithuburl;
        const githubOrgName = req.user.organisationname;

        const history = await ScanResult.findOne({ githubOrgName });
        console.log('1');
        console.log(history);

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
            termOut: req.termOut,
            history: history
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

router.post('/nuclei', auth, lrnuclei, async (req, res) => {
    try {
        const { severity, tag, url } = req.body;
        const extractedIssues = req.data
        const terminal = req.terminalOut;
        const normalizedUrl = url;
        const payload = {
            terminalOut: terminal,
            extractedIssues: extractedIssues,
            url: normalizedUrl
        };
        res.status(201).send({ payload });
    } catch (e) {
        console.error("Caught error:", e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.post("/thirdpartySast", sastThird, async (req, res) => {
    try {
        const extractedIssues = req.extractedIssues;
        const termOut = req.terminalOut;
        res.status(200).send({ extractedIssues, termOut });
    } catch (error) {
        res.status(404).send({ error });
    }
});



module.exports = router;
