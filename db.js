cat > db.js << 'EOF'
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'watchlist.json');
let accounts = [];

function loadDB() {
  try {
    accounts = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) || [];
  } catch(e) {
    accounts = [];
  }
}

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(accounts, null, 2));
}

loadDB();

module.exports = {
  addAccount: (username, channelId, followers) => {
    accounts = accounts.filter(a => a.username !== username.toLowerCase());
    accounts.push({
      username: username.toLowerCase(),
      channelId,
      followers: followers || 0,
      lastStatus: 'active',
      failCount: 0,
      startTime: new Date().toISOString(),
      lastChangeTime: null
    });
    saveDB();
  },
  
  getAccounts: () => accounts.filter(a => a.failCount < 3),
  
  updateStatus: (username, status) => {
    const account = accounts.find(a => a.username === username.toLowerCase());
    if (account) {
      account.lastStatus = status;
      account.lastChangeTime = new Date().toISOString();
      account.failCount = 0;
      saveDB();
    }
  },
  
  incrementFail: (username) => {
    const account = accounts.find(a => a.username === username.toLowerCase());
    if (account) {
      account.failCount++;
      saveDB();
    }
  },
  
  updateFollowers: (username, followers) => {
    const account = accounts.find(a => a.username === username.toLowerCase());
    if (account) {
      account.followers = followers;
      saveDB();
    }
  },
  
  getAccount: (username) => {
    return accounts.find(a => a.username === username.toLowerCase()) || null;
  }
};
EOF