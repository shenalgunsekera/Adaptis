"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/* ============================================================================
   Firebase, browser side.

   Used only by the admin panel: sign-in, and uploading imagery to Storage.
   The public site never loads this — it is server-rendered from Firestore
   through the Admin SDK, so visitors download no Firebase code at all.
   ========================================================================= */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isClientConfigured = Boolean(config.apiKey && config.projectId);

let cached: FirebaseApp | null = null;

export function clientApp(): FirebaseApp {
  if (!isClientConfigured) {
    throw new Error(
      "Firebase client is not configured. Set the NEXT_PUBLIC_FIREBASE_* variables."
    );
  }
  if (cached) return cached;
  cached = getApps().length ? getApp() : initializeApp(config);
  return cached;
}

export function clientAuth(): Auth {
  return getAuth(clientApp());
}

export function clientStorage(): FirebaseStorage {
  return getStorage(clientApp());
}
