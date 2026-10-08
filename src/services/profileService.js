import { supabase } from '../lib/supabaseClient';

const toProfile = (profile) => ({
	id: profile.id,
	username: profile.username,
	name: profile.full_name,
	avatar: profile.avatar_url || '/avatars/default.png',
});

const throwIfError = (error) => {
	if (error) throw error;
};

export const profileService = {
	getAllUsers: async () => {
		const { data, error } = await supabase
			.from('profiles')
			.select('id, username, full_name, avatar_url')
			.order('username');
		throwIfError(error);
		return data.map(toProfile);
	},

	getContacts: async (userId) => {
		const { data, error } = await supabase
			.from('contacts')
			.select('contact:profiles!contacts_contact_id_fkey(id, username, full_name, avatar_url)')
			.eq('user_id', userId)
			.order('created_at');
		throwIfError(error);
		return data.map(({ contact }) => toProfile(contact));
	},

	addContact: async (contactId) => {
		const { error } = await supabase.rpc('add_contact', {
			target_user_id: contactId,
		});
		throwIfError(error);
	},

	removeContact: async (contactId) => {
		const { error } = await supabase.rpc('remove_contact', {
			target_user_id: contactId,
		});
		throwIfError(error);
	},
};
