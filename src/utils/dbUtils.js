import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'db.json');

export const saveToDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving to database:', error);
    return false;
  }
};

export const readFromDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from database:', error);
    return null;
  }
};
