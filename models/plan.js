const mongoose = require('mongoose');

const PlanSchema = mongoose.Schema(
    {
  name: { type: String, required: true },
  description: { type: String },
  fitnessGoal: { type: String, required: true },
  calorieRange: { 
    min: { type: Number }, // Minimum calorie count per day
    max: { type: Number }  // Maximum calorie count per day
  },
  mealFrequency: { 
    type: Number,  // Number of meals per day
    default: 3     // Default to three meals a day
  },
  dietaryRestrictions: [String], // List of dietary restrictions (e.g., gluten-free, vegetarian)
  meals: [
    {
      mealType: { type: String }, // e.g., Breakfast, Lunch, Dinner
      items: [{ type: String }],  // List of items
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
);

PlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PlanModel = mongoose.model('plan', PlanSchema);

module.exports = { PlanModel }