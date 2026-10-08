import { supabase } from '../lib/supabaseClient';

const toAppUser = (user) => {
	if (!user) return null;

	const username =
		user.user_metadata?.username || user.email?.split('@')[0] || 'user';

	return {
		id: user.id,
		email: user.email,
		username,
		name: user.user_metadata?.full_name || username,
		avatar: user.user_metadata?.avatar_url || '/avatars/default.png',
	};
};

export const authService = {
	loginUser: async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		});

		return error
			? { error: error.message }
			: { user: toAppUser(data.user) };
	},

	registerUser: async (name, username, email, password) => {
		const normalizedUsername = username.trim().toLowerCase();
		const { data, error } = await supabase.auth.signUp({
			email: email.trim(),
			password,
			options: {
				data: {
					full_name: name.trim(),
					username: normalizedUsername,
				},
				emailRedirectTo: `${window.location.origin}/login`,
			},
		});

		if (error) return { error: error.message };
		if (!data.session) return { confirmationRequired: true };

		return { user: toAppUser(data.user) };
	},

	getCurrentUser: async () => {
		const { data, error } = await supabase.auth.getSession();
		return error
			? { error: error.message }
			: { user: toAppUser(data.session?.user) };
	},

	onAuthStateChange: (callback) => {
		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			callback(toAppUser(session?.user));
		});
		return data.subscription;
	},

	logoutUser: async () => {
		const { error } = await supabase.auth.signOut();
		return error ? { error: error.message } : {};
	},
};
