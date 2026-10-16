app.get('/api/leave-balance/:rollNumber', async (req, res) => {
    try {
        const student = await Student.findOne({
            rollNumber: req.params.rollNumber
        });

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.json({
            rollNumber: student.rollNumber,
            casualLeave: student.casualLeave,
            medicalLeave: student.medicalLeave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});