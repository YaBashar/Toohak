import { Store } from './interface';
import fs from 'fs';

let data: Store = {
  users: [],
  quizzes: [],
  sessions: [],
  trash: [],
  games: [],
};

function getData(): Store {
  return data;
}

function setData(newData: Store) {
  const dataString = JSON.stringify(data, null, 2);
  fs.writeFileSync('data.json', dataString);
  data = newData;
}

// Save data every 10 minutes
// setInterval(saveData, 10 * 60 * 1000);

export { getData, setData };
