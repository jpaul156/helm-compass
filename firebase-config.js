// ---------------------------------------------------------------
// Wall Board — Firebase configuration
// Create a NEW Firebase project (console.firebase.google.com),
// add a Web App, enable Firestore, then paste your config below.
// While apiKey is still "PASTE_ME", both views run in demo mode
// with sample data so you can preview the design.
// ---------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyBeuT90fdftC_Rq951oN9Eo9N-24z2-bt0",
  authDomain: "helm-compass.firebaseapp.com",
  projectId: "helm-compass",
  storageBucket: "helm-compass.firebasestorage.app",
  messagingSenderId: "1048830524006",
  appId: "1:1048830524006:web:ca55b2c3e36cd07d808ba7"
};

// Default categories, seeded on first run (editable in the mobile app).
export const DEFAULT_CATEGORIES = [
  { name: "Gabe",     color: "#AEE1F9", text: "#123A52", starry: false, order: 1 }, // light blue
  { name: "Civic",    color: "#FFD84D", text: "#4A3B00", starry: false, order: 2 }, // MBTA yellow
  { name: "Friends",  color: "#FFCBA4", text: "#5C3418", starry: false, order: 3 }, // peach
  { name: "Medical",  color: "#FF7B6B", text: "#4A0E06", starry: false, order: 4 }, // red
  { name: "Work",     color: "#B9E8A8", text: "#1C4212", starry: false, order: 5 }, // Illuminate light green
  { name: "Finances", color: "#1E6B3C", text: "#EAF7EE", starry: false, order: 6 }, // dark green
  { name: "Tonight",  color: "#141B4D", text: "#EDEBFF", starry: true,  order: 7 }  // starry night
];

// Sample tasks for demo mode only (never written to Firestore).
// scheduledAt / targetAt are ms epoch numbers; offsets here demo upcoming and overdue styling.
export const DEMO_TASKS = [
  { id:"d1", title:"Send paperwork to tax preparer", cat:5, status:"todo",  important:true,  urgent:true  },
  { id:"d2", title:"Pay electric bill",              cat:5, status:"todo",  important:true,  urgent:false, scheduledAt: Date.now() - 2*864e5 },
  { id:"d3", title:"Add new Bounty Board challenge", cat:0, status:"todo",  important:false, urgent:false },
  { id:"d4", title:"Submit expense report",          cat:4, status:"doing", important:true,  urgent:true,  targetAt: Date.now() + 864e5 },
  { id:"d5", title:"Moreland St petition signatures",cat:1, status:"doing", important:true,  urgent:false },
  { id:"d6", title:"Tonight: event scraper for Crystal Ballroom", cat:6, status:"todo", important:false, urgent:false },
  { id:"d7", title:"Email city council re: upzoning",cat:1, status:"waiting", important:true, urgent:false },
  { id:"d8", title:"Dentist appointment booked",     cat:3, status:"done", important:false, urgent:false },
  { id:"d9", title:"NX panel firmware notes to team",cat:4, status:"done", important:false, urgent:false }
];
