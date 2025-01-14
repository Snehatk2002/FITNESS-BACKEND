const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { userModel } = require("./models/user")
const { adminModel } = require("./models/admin")
const { trainerModel } = require("./models/trainer")
const { accessoryModel } = require("./models/accessory")
const { machineModel } = require("./models/machine")
const { workoutModel } = require("./models/workout")
const { feedbackModel } = require("./models/feedback")
const { profileModel } = require("./models/userprofile")
const { PlanModel } = require("./models/plan")




const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://snehatk:6282011259@cluster0.jd3vcot.mongodb.net/fitnessdb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async(password) =>{
    const salt = await bcrypt.genSalt(10)  
    return bcrypt.hash(password,salt)
}


//--------------------------------------------------------------USER----------------------------------------------

app.post("/userSignUp",async(req,res)=>{

    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    console.log(hashedPassword)

    input.password = hashedPassword     
    let user = new userModel(input)
    user.save()
    console.log(user)

    res.json({"status":"success"})
})

app.post("/userSignIn", (req, res) => {
    let input = req.body;

    // Check if the role exists in the request
    if (!input.role) {
        return res.json({ "status": "role not specified" });
    }

    // Select the appropriate model based on the user's role
    let model;
    switch (input.role) {
        case 'user':
            model = userModel;
            break;
        case 'trainer':
            model = trainerModel;
            break;
       
        default:
            return res.json({ "status": "invalid role" });
    }

    // Perform login based on the selected model
    model.findOne({ email: input.email })
        .then((user) => {
            if (user) {
                // Define static passwords for roles
                const staticPasswords = {
                    trainer: "trainer123",
                   
                };

                // Check if the role matches the user's role
                if (input.role in staticPasswords) {
                    // If the user role is one of the static roles, check against the static password
                    if (input.password === staticPasswords[input.role]) {
                        // If login is successful, generate a token
                        jwt.sign({ email: user.email, role: user.role }, "fitness-app", { expiresIn: "1d" },
                            (error, token) => {
                                if (error) {
                                    res.json({ "status": "unable to create token" });
                                } else {
                                    res.json({ "status": "success", "userid": user._id, "token": token });
                                }
                            }
                        );
                    } else {
                        res.json({ "status": "incorrect password" });
                    }
                } else {
                    // For users without a static password (dynamic password check)
                    let dbPassword = user.password; // Get the hashed password from the database

                    // Compare input password with the hashed password
                    bcrypt.compare(input.password, dbPassword, (error, isMatch) => {
                        if (isMatch) {
                            // If login is successful, generate a token
                            jwt.sign({ email: user.email, role: user.role }, "fitness-app", { expiresIn: "1d" },
                                (error, token) => {
                                    if (error) {
                                        res.json({ "status": "unable to create token" });
                                    } else {
                                        res.json({ "status": "success", "userid": user._id, "token": token });
                                    }
                                }
                            );
                        } else {
                            res.json({ "status": "incorrect password" });
                        }
                    });
                }
            } else {
                res.json({ "status": "user not found" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ "status": "error", "message": "Internal Server Error" });
        });
});

//-------------------------------------------------------------ADMIN-----------------------------------------------

app.post("/AdminLogin", (req, res) => {
    let input = req.body;

    // Default admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if the input matches admin credentials
    if (input.email === adminEmail && input.password === adminPassword) {
        // Admin login successful
        jwt.sign({ email: input.email }, "fitness-app", { expiresIn: "1d" }, (error, token) => {
            if (error) {
                res.json({ "status": "Token credentials failed" });
            } else {
                res.json({ "status": "success", "token": token, "message": "Admin logged in successfully" });
            }
        });
    } else {
        // Check if the user exists in the database
        adminModel.find({ name: input.name }).then((response) => {
            if (response.length > 0) {
                const validator = bcrypt.compareSync(input.password, response[0].password);
                if (validator) {
                    // User login successful
                    jwt.sign({ email: input.email}, "fitness-app", { expiresIn: "1d" }, (error, token) => {
                        if (error) {
                            res.json({ "status": "Token credentials failed" });
                        } else {
                            res.json({ "status": "success", "token": token });
                        }
                    });
                } else {
                    res.json({ "status": "Wrong password" });
                }
            } else {
                res.json({ "status": "Username doesn't exist" });
            }
        }).catch((err) => {
            res.json({ "status": "Error occurred", "error": err.message });
        });
    }
});


// ----------------------------------------------------------TRAINERS--------------------------------------------

app.post("/AddTrainers",(req,res)=>{
    let input=req.body
    let trainer =new trainerModel(input)
    trainer.save()
    console.log(trainer)
    res.json({"status":"success"})
})
 
app.post("/ViewTrainers",(req,res)=>{
    trainerModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

app.delete('/deleteTrainer/:id', async (req, res) => {
    try {
        const trainerId = req.params.id;
        // Use `findOneAndDelete` with your custom `id` field
        const result = await trainerModel.findOneAndDelete({ id: trainerId });

        if (result) {
            res.status(200).json({ message: 'Trainer deleted successfully' });
        } else {
            res.status(404).json({ message: 'Trainer not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// ------------------------------------------------ACCESSORY---------------------------------------------------------------

// Add Accessory
app.post('/AddAccessories', async (req, res) => {
    try {
        const { name, category, price, stock, image } = req.body;
        
        if (!name || !category || !price || !stock || !image) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }

        const newAccessory = new accessoryModel({
            name,
            category,
            price,
            stock,
            image
        });

        await newAccessory.save();
        res.status(200).json({ status: 'success', message: 'Accessory added successfully' });
    } catch (error) {
        console.error('Error adding accessory:', error);
        res.status(500).json({ status: 'error', message: 'Failed to add accessory' });
    }
});


// View Accessories
app.get('/ViewAccessories', async (req, res) => {
    try {
        const accessories = await accessoryModel.find();
        res.status(200).json(accessories);
    } catch (error) {
        console.error('Error fetching accessories:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch accessories' });
    }

});


//  to delete an accessory by name
app.delete('/deleteAccessory/:name', async (req, res) => {
    try {
        const accessoryName = req.params.name;
        const result = await accessoryModel.findOneAndDelete({ name: accessoryName });

        if (result) {
            res.status(200).json({ message: 'Accessory deleted successfully' });
        } else {
            res.status(404).json({ message: 'Accessory not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//-------------------------------------------------------------MACHINE---------------------------------------


app.post("/AddMachines",(req,res)=>{
    let input=req.body
    let machine =new machineModel(input)
    machine.save()
    console.log(machine)
    res.json({"status":"success"})
})
 
app.post("/ViewMachines",(req,res)=>{
    machineModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})



app.delete('/deleteMachine/:machineid', async (req, res) => {
    try {
        const machineId = req.params.machineid;
        // Use `findOneAndDelete` with your custom `machineid` field
        const result = await machineModel.findOneAndDelete({ machineid: machineId });

        if (result) {
            res.status(200).json({ message: 'Machine deleted successfully' });
        } else {
            res.status(404).json({ message: 'Machine not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// -----------------------------------------------WORKOUT SCHEDULING--------------------------------------

app.post("/WorkoutSchedule", async (req, res) => {
    const { name,email, workoutType, membershipType, trainerName,traineremail, date, time } = req.body;

    try {
        // Validate if all required fields are provided
        if (!name||!email || !workoutType || !membershipType || !trainerName ||!traineremail|| !date || !time) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        // Check if the trainer is already booked for the same date and time
        const existingBooking = await workoutModel.findOne({
            trainerName,
            date,
            time
        });

        if (existingBooking) {
            // If a booking is found, send a message that the trainer is already booked
            return res.status(409).json({ status: 'error', message: 'Trainer already booked for this time slot' });
        } 
        
        // Proceed with creating the new booking if no conflict
        const workout = new workoutModel({
            name,
            email,
            workoutType,
            membershipType,
            trainerName,
            traineremail,
            date,
            time
        });

        await workout.save();

        // Return success response
        return res.status(201).json({ status: 'success', message: 'Workout successfully booked' });

    } catch (error) {
        console.error("Error during workout scheduling:", error);
        // Return server error response with details
        return res.status(500).json({ status: 'error', message: 'Server error. Please try again later.' });
    }
});


 
app.post("/ViewWorkoutSchedule",(req,res)=>{
    workoutModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

// Delete a Workout Schedule by email
app.delete('/WorkoutSchedule/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const result = await workoutModel.deleteMany({ email });
        if (result.deletedCount > 0) {
            res.status(200).json({ status: 'success', message: 'Schedules deleted successfully' });
        } else {
            res.status(404).json({ status: 'error', message: 'Schedules not found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});


// API endpoint to get workout schedule for a specific trainer using email
app.post('/ViewWorkoutSchedule', async (req, res) => {
    const { trainerEmail } = req.body; // Get the trainer's email from the request body
    try {
        const bookings = await workoutModel.find({ traineremail: trainerEmail }); // Fetch bookings for the specific trainer
        res.status(200).json(bookings); // Return the bookings
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' }); // Handle errors
    }
});




//-------------------------------------------FEEDBACK---------------------------------------------------------

// Submit feedback
app.post('/submitFeedback', async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ status: 'error', message: 'email and message are required.' });
    }

    try {
        // Create feedback entry
        const newFeedback = new feedbackModel({
            feedbackId: Date.now().toString(), // Use current timestamp as a unique ID
            email,
            message,
            submittedDate: new Date() // Automatically sets current date
        });

        // Save feedback to the database
        const savedFeedback = await newFeedback.save();
        res.status(201).json({ status: 'success', data: savedFeedback });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
})


app.get('/viewFeedbacks', async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find(); // Use feedbackModel
        res.json({ status: "success", data: feedbacks });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
})

// Route to delete feedback by ID (admin side)
app.delete('/deleteFeedback/:feedbackId', async (req, res) => {
    try {
        const feedbackId = req.params.feedbackId.trim(); // Extract and trim feedbackId from URL parameters

        const deletedFeedback = await feedbackModel.findOneAndDelete({ feedbackId });

        if (!deletedFeedback) {
            return res.status(404).json({ status: "error", message: "Feedback not found" });
        }

        res.json({ status: "success", message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


//---------------------------------USERPROFILE----------------------------------------





  app.get('/profile/:email', async (req, res) => {
    console.log('Received request for profile email:', req.params.email); // Debug log
    try {
      const user = await userModel.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
// Fetch all Profiles
app.get('/userprofile', async (req, res) => {
    try {
      const profiles = await userModel.find();
      res.json(profiles);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  })


  // Delete a specific Profile by email
app.delete('/profile/:email', async (req, res) => {
    try {
      const result = await userModel.deleteOne({ email: req.params.email });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
//-------------------------------------------DIET PLAN--------------------------------------------------


// Create a new diet plan
app.post('/dietPlan', async (req, res) => {
    try {
      const dietPlan = new PlanModel(req.body);
      await dietPlan.save();
      res.status(201).json({ message: 'Diet plan created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error creating diet plan', error });
    }
  });


  // Get diet plans by fitness goal
app.get('/dietPlan/:fitnessGoal', async (req, res) => {
    try {
      const dietPlans = await PlanModel.find({ fitnessGoal: req.params.fitnessGoal });
      if (dietPlans.length === 0) {
        return res.status(404).json({ message: 'No diet plans found for this fitness goal' });
      }
      res.json(dietPlans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching diet plans', error });
    }
  });

  // Fetch all diet plans (admin view)
app.get('/admindietPlans', async (req, res) => {
    try {
      const dietPlans = await PlanModel.find();
      res.json(dietPlans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching diet plans', error });
    }
  });

  // Delete a diet plan by name
app.delete('/dietPlan/name/:name', async (req, res) => {
    const { name } = req.params;
  
    try {
      const result = await PlanModel.findOneAndDelete({ name: name });
      if (!result) {
        return res.status(404).json({ message: 'Diet plan not found' });
      }
      res.json({ message: 'Diet plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting diet plan', error });
    }
  });

//-----------------------------TRAINER LOGIN------------------------------------------

// Endpoint to get bookings for a specific trainer
app.post('/getTrainerBookings', async (req, res) => {
    const { trainerEmail } = req.body;

    try {
        // Fetch bookings for the specific trainer
        const bookings = await workoutModel.find({ traineremail: trainerEmail });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching trainer bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Trainer Profile by Email
app.get("/trainerProfile/:email", async (req, res) => {
    const email = req.params.email;
    
    try {
        const trainer = await trainerModel.findOne({ email });
        
        if (!trainer) {
            return res.status(404).json({ message: "Trainer profile not found." });
        }

        res.json(trainer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the trainer profile." });
    }
});


app.listen(8080, () => {
    console.log("server started")
})

