import { PATH_DB } from '../constants/contacts.js';
import fs from 'node:fs';

export const readContacts = async () => {
  try {
    const response = await fs.promises.readFile(PATH_DB, 'utf8');
    const data = JSON.parse(response);
    return data;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
