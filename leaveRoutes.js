
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, rollNumber, casualLeave, medicalLeave } = req.body;

        if (!username || !email || !rollNumber) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please log in."
            });
        }

        const user = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            rollNumber: rollNumber.trim(),
            casualLeave: Number(casualLeave ?? 10),
            medicalLeave: Number(medicalLeave ?? 10)
        });

        res.status(201).json({
            message: "Registration successful",
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found. Please register first."
            });
        }

        res.json({
            message: "Login successful",
            userId: user._id,
            username: user.username,
            rollNumber: user.rollNumber,
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET LEAVE BALANCE
router.get("/balance/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            username: user.username,
            rollNumber: user.rollNumber,
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// APPLY FOR LEAVE
router.post("/apply/:id", async (req, res) => {
    try {
        const { type, days } = req.body;
        const numberOfDays = Number(days);
        const leaveType = String(type || "").toLowerCase();

        if (
            !["casual", "medical"].includes(leaveType) ||
            !Number.isInteger(numberOfDays) ||
            numberOfDays < 1
        ) {
            return res.status(400).json({
                message: "Select a valid leave type and number of days"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const balanceField =
            leaveType === "casual" ? "casualLeave" : "medicalLeave";

        if (user[balanceField] < numberOfDays) {
            return res.status(400).json({
                message: "Insufficient leave balance"
            });
        }

        user[balanceField] -= numberOfDays;
        await user.save();

        res.json({
            message: "Leave applied successfully",
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
