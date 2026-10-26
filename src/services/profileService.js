import { supabase } from '../lib/supabaseClient';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
]);

const toProfile = (profile) => ({
	id: profile.id,
	username: profile.username,
	name: profile.full_name,
	avatar: profile.avatar_url || '/avatars/default.svg',
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

	updateAvatar: async (userId, file) => {
		const extension = AVATAR_TYPES.get(file.type);
		if (!extension) {
			throw new Error('Choose a PNG, JPEG, or WebP image.');
		}
		if (file.size > MAX_AVATAR_SIZE) {
			throw new Error('Avatar images must be 5 MB or smaller.');
		}

		const path = `${userId}/avatar`;
		const { error: uploadError } = await supabase.storage
			.from(AVATAR_BUCKET)
			.upload(path, file, {
				cacheControl: '0',
				contentType: file.type,
				upsert: true,
			});
		throwIfError(uploadError);

		const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
		const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
		const { error: updateError } = await supabase
			.from('profiles')
			.update({ avatar_url: avatarUrl })
			.eq('id', userId);
		throwIfError(updateError);

		return avatarUrl;
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
