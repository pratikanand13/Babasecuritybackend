const express = require("express");
const router = new express.Router();
const auth = require('../middleware/dashboardAuth');
const Dashboard = require("../models/dashboardSchema");


router.post("/user/signUp", async (req, res) => {
    const user = new Dashboard(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.patch('/user/update', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send('Invalid updates!');

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await Dashboard.findbyCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Get Logged-In User
router.get('/user/me', auth, async (req, res) => {
    res.send(req.user);
});

// Delete User
router.delete('/user/delete', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// User Logout
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Logout from All Devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;
