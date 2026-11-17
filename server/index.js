require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express()
const mongodb_conection= require('./config/mongodbConect')
const Student = require('./model/studentModel');


app.use(cors());
app.use(express.json());


mongodb_conection()

// Students Add
app.post('/student/add', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and Email are Required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid Email Format"
      });
    }

    // Check email
    const checkEmail = await Student.findOne({ email:email });

    if (checkEmail) {
      return res.status(400).json({
        message: "Email Already Exists",
      });
    }

    // Create student
    const student = new Student({
      name:name,
      email:email,
      records: []
    });

    await student.save();

    res.status(201).json({
      message: "Student Added Successfully",
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: "Student Add Failed",
      error: error.message,
    });
  } 
});


//  All students
app.get('/student/all', async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      message: "Students Add Successfully",
      total: students.length,
      students,
    });

  } catch (error) {
    res.status(500).json({
      message: "Students Add Failed",
      error: error.message,
    });
  }
});


//  Single student by id
app.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Invalid ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Student ID"
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student Not Found"
      });
    }

    res.status(200).json({
      message: "Student Fetched Successfully",
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: "Fetch Failed",
      error: error.message,
    });
  }
});

// Student Attendence
app.post('/student/update/:id', async (req, res) => {
  try {
    const { attendance, homeWork, date } = req.body;

    const { id } = req.params;

    // Invalid ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Student ID"
      });
    }

    // Date validation
    if (!date) {
      return res.status(400).json({
        message: "Date is Required"
      });
    }

    // attendance / homeWork boolean validation
    if (typeof attendance !== "boolean" || typeof homeWork !== "boolean") {
      return res.status(400).json({
        message: "Attendance and HomeWork must be Boolean"
      });
    }

    // Date format: YYYY-MM-DD
    const formattedDate = new Date(`${date}T00:00:00.000Z`);

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid Date"
      });
    }

    // Find student
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student Not Found"
      });
    }

    // Check existing record by date
    const existingRecord = student.records.find(record =>
      record.date.toISOString().split("T")[0] === date
    );

    if (existingRecord) {
      // Update existing record
      existingRecord.attendance = attendance;
      existingRecord.homeWork = homeWork;
    } else {
      // Add new record
      student.records.push({
        attendance,
        homeWork,
        date: formattedDate
      });
    }

    await student.save();

    res.status(200).json({
      message: existingRecord
        ? "Attendance Updated Successfully"
        : "Attendance Added Successfully",
      student
    });

  } catch (error) {
    res.status(500).json({
      message: "Attendance Operation Failed",
      error: error.message
    });
  }
});



// DELETE student
app.delete('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Invalid ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Student ID"
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        message: "Student Not Found"
      });
    }

    res.status(200).json({
      message: "Student Deleted Successfully",
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: "Delete Failed",
      error: error.message,
    });
  }
});


app.listen(process.env.PORT, () => {
  console.log("Runnig port", process.env.PORT)
})