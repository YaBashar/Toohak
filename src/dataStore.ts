import { Store } from './interface';
import fs from 'fs';

let data: Store = {
  users: [],
  quizzes: [],
  sessions: [],
  trash: []
};

// Load data from file on startup
if (fs.existsSync('data.json')) {
  const rawData = fs.readFileSync('data.json', 'utf-8');
  data = JSON.parse(rawData);
}

function getData(): Store {
  return data;
}

function setData(newData: Store) {
  data = newData;
}

// Save data to file
function saveData() {
  const dataString = JSON.stringify(data);
  fs.writeFileSync('data.json', dataString);
}

// Save data every 10 minutes
setInterval(saveData, 10 * 60 * 1000);

export { getData, setData };
