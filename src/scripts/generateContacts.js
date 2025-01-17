import { createFakeContact } from '../utils/createFakeContact.js';
import { writeContacts } from '../utils/writeContacts.js';
import { readContacts } from '../utils/readContacts.js';

const generateContacts = async (number) => {
  const arrayOfContacts = await readContacts();
  const newContacts = [];
  try {
    for (let i = 0; i < number; i++) {
      const newContact = createFakeContact();
      newContacts.push(newContact);
    }
    const updatedContacts = [...arrayOfContacts, ...newContacts];
    await writeContacts(updatedContacts);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

generateContacts(5);
