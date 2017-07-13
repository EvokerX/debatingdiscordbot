const komada = require('komada');
console.log('[debug] All requires loaded. ');

komada.start({
  "botToken": "AH AH AAH!",
  "ownerID" : "172003405399719936",
  "prefix": "~",
  "clientOptions": {
   "fetchAllMembers": true
  }
});
console.log('[debug] bot Client created. ');
