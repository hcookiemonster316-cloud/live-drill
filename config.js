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
  // One entry per chapter question bank in the chapters folder.
  chapters: [
    { id: 'ch5', title: 'Chapter 5', file: 'ch5.json', hub: 'https://claude.ai/artifact/FCt8dGZe3PWnASYvu2u6iF' }
  ]
};
