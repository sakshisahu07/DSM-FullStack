import mongoose from "mongoose";

export async function seedDefaultLocations() {
  try {
    // Check if models are already compiled to avoid OverwriteModelError
    const State = mongoose.models.State || mongoose.model("State", new mongoose.Schema({}, { strict: false }));
    const City = mongoose.models.City || mongoose.model("City", new mongoose.Schema({}, { strict: false }));
    const Country = mongoose.models.Country || mongoose.model("Country", new mongoose.Schema({}, { strict: false }));

    // 1. Add "New Delhi" for Delhi
    const delhiState = await State.findOne({ name: /Delhi/i });
    if (delhiState) {
      const existingNewDelhi = await City.findOne({ name: "New Delhi", stateId: delhiState._id });
      if (!existingNewDelhi) {
        await City.create({
          name: "New Delhi",
          stateId: delhiState._id,
          countryId: delhiState.countryId,
          disable: false
        });
        console.log("[SEED] Created city 'New Delhi' for Delhi state!");
      }
    }

    // 2. Add state "Beijing" and city "Beijing" for China
    const chinaCountry = await Country.findOne({ name: /China/i });
    if (chinaCountry) {
      let beijingState = await State.findOne({ name: "Beijing", countryId: chinaCountry._id });
      if (!beijingState) {
        beijingState = await State.create({
          name: "Beijing",
          countryId: chinaCountry._id,
          disable: false
        });
        console.log("[SEED] Created state 'Beijing' for China!");
      }

      const existingBeijingCity = await City.findOne({ name: "Beijing", stateId: beijingState._id });
      if (!existingBeijingCity) {
        await City.create({
          name: "Beijing",
          stateId: beijingState._id,
          countryId: chinaCountry._id,
          disable: false
        });
        console.log("[SEED] Created city 'Beijing' for Beijing state!");
      }
    }
  } catch (err) {
    console.error("[SEED ERROR] Failed to seed locations:", err.message);
  }
}
