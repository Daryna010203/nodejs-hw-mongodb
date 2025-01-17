import { createFakeContact } from '../utils/createFakeContact.js';
import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const addOneContact = async () => {
  try {
    let newContacts = [];
    const arrayOfContacts = await readContacts();
    const newContact = createFakeContact();
    newContacts = [...arrayOfContacts, newContact];
    await writeContacts(newContacts);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

addOneContact();
