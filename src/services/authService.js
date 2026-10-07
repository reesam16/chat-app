import { MOCK_USERS } from '../data/users';

const USERS_KEY = 'chat_app_registered_users';
const SESSION_KEY = 'chat_app_current_user';
export const DEMO_PASSWORD = 'demo123';

const readRegisteredUsers = () => {
	try {
		const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
		return Array.isArray(users) ? users : [];
	} catch {
		return [];
	}
};

const publicUser = ({ password, ...user }) => user;

export const authService = {
	loginUser: (username, password) => {
		const normalizedUsername = username.trim().toLowerCase();
		const mockUsers = MOCK_USERS.map((user) => ({
			...user,
			password: DEMO_PASSWORD,
		}));
		const user = [...mockUsers, ...readRegisteredUsers()].find(
			(candidate) =>
				candidate.username.toLowerCase() === normalizedUsername &&
				candidate.password === password
		);

		return user ? { user: publicUser(user) } : { error: 'Invalid username or password.' };
	},

	registerUser: (name, username, password) => {
		const normalizedName = name.trim();
		const normalizedUsername = username.trim().toLowerCase();
		const registeredUsers = readRegisteredUsers();
		const usernameTaken = [...MOCK_USERS, ...registeredUsers].some(
			(user) => user.username.toLowerCase() === normalizedUsername
		);

		if (usernameTaken) {
			return { error: 'That username is already taken.' };
		}

		const user = {
			id: `usr_${crypto.randomUUID()}`,
			name: normalizedName,
			username: normalizedUsername,
			avatar: '/avatars/default.png',
			password,
		};

		localStorage.setItem(USERS_KEY, JSON.stringify([...registeredUsers, user]));
		return { user: publicUser(user) };
	},

	getCurrentUser: () => {
		try {
			return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
		} catch {
			return null;
		}
	},

	saveCurrentUser: (user) => {
		localStorage.setItem(SESSION_KEY, JSON.stringify(user));
	},

	logoutUser: () => {
		localStorage.removeItem(SESSION_KEY);
	},
};
