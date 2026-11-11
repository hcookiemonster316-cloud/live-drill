// Settings for the live game site. Paste your Firebase web app settings below (setup guide, step 3).
window.LIVE_CONFIG = {
  siteName: 'Live Drill',
  maxPlayers: 50, // tested with 30 at once; Firebase's free plan allows 100 connections at a time
  firebase: {
    apiKey: 'AIzaSyDHOBVh_6JG5CUaeulhdwHrG-LifdECD5U',
    authDomain: 'live-drill.firebaseapp.com',
    databaseURL: 'https://live-drill-default-rtdb.firebaseio.com',
    projectId: 'live-drill',
    storageBucket: 'live-drill.firebasestorage.app',
    messagingSenderId: '1074133323205',
    appId: '1:1074133323205:web:5a62632ba39f561bb78fac'
  },
  // Events, such as a Qualification Week before a block exam: dates are YYYY-MM-DD; x multiplies squad points.
  // Example: { name: 'Qualification Week', from: '2026-11-16', to: '2026-11-22', x: 2, note: 'Chapter 5 block exam Friday' }
  events: [],
  // One entry per chapter question bank in the chapters folder.
  chapters: [
    { id: 'ch5', title: 'Chapter 5', file: 'ch5.json', hub: 'https://claude.ai/artifact/FCt8dGZe3PWnASYvu2u6iF' }
  ]
};
