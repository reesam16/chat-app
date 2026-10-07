import { MOCK_USERS } from '../data/users';

const USERS_KEY = 'chat_app_registered_users';
const CONTACTS_KEY = 'chat_app_contacts';

const readArray = (key) => {
	try {
		const value = JSON.parse(localStorage.getItem(key) || '[]');
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
};

const readContactMap = () => {
	try {
		const value = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '{}');
		return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
};

const withoutPassword = ({ password, ...user }) => user;

const getContactIds = (userId, contactMap) => {
	if (Array.isArray(contactMap[userId])) {
		return contactMap[userId];
	}

	return MOCK_USERS.filter((user) => user.id !== userId).map((user) => user.id);
};

export const profileService = {
	getAllUsers: () => [
		...MOCK_USERS,
		...readArray(USERS_KEY),
	].map(withoutPassword),

	getContacts: (userId) => {
		const usersById = new Map(
			profileService.getAllUsers().map((user) => [user.id, user])
		);
		const contactMap = readContactMap();

		return getContactIds(userId, contactMap)
			.filter((contactId) => contactId !== userId)
			.map((contactId) => usersById.get(contactId))
			.filter(Boolean);
	},

	addContact: (userId, contactId) => {
		const knownUser = profileService.getAllUsers().some(
			(user) => user.id === contactId
		);
		if (!knownUser || userId === contactId) {
			return profileService.getContacts(userId);
		}

		const contactMap = readContactMap();
		const contactIds = getContactIds(userId, contactMap);
		contactMap[userId] = [...new Set([...contactIds, contactId])];
		localStorage.setItem(CONTACTS_KEY, JSON.stringify(contactMap));

		return profileService.getContacts(userId);
	},

	removeContact: (userId, contactId) => {
		const contactMap = readContactMap();
		const contactIds = getContactIds(userId, contactMap);
		contactMap[userId] = contactIds.filter((id) => id !== contactId);
		localStorage.setItem(CONTACTS_KEY, JSON.stringify(contactMap));

		return profileService.getContacts(userId);
	},
};
