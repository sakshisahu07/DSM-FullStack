// models/atlPage.model.js
import mongoose from "mongoose";

const atlPageSchema = new mongoose.Schema(
  {
    singleton: {
      type: Boolean,
      default: true,
      unique: true, // 🚨 ensures only ONE document
    },

    banner: {
      url: String,
      key: String,
    },

    heading: String,
    description: String,

    subTitle: String,
    subDescription: String,

    cards: [
      {
        icon: {
          url: String,
          key: String,
        },
        title: String,
        description: String,
      },
    ],

    images: [
      {
        url: String,
        key: String,
      },
    ],

    commonFeatures: {
      heading: String,
      description: String,
    },

    processHeading: String,
    processImage: {
      url: String,
      key: String,
    },

    setupHeading: String,
    setupImage: {
      url: String,
      key: String,
    },

    setupDetails: [
      {
        title: String,
        setupIcon: {
          url: String,
          key: String,
        },
        description: String,
      },
    ],

    setProcess: [
      {
        heading: String,
        processIcon: {
          url: String,
          key: String,
        },
        description: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("AtlPage", atlPageSchema);