require("dotenv").config();

const { getApps, initializeApp, applicationDefault } = require("firebase-admin/app");

const firebaseAdmin = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: applicationDefault(),
    });

module.exports = firebaseAdmin;