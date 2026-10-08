import { supabase } from '../lib/supabaseClient';

const toMessage = (message) => ({
	id: message.id,
	senderId: message.sender_id,
	text: message.body,
	createdAt: message.created_at,
});

const throwIfError = (error) => {
	if (error) throw error;
};

export const chatService = {
	getConversation: async (contactId) => {
		const { data, error } = await supabase.rpc(
			'get_or_create_direct_conversation',
			{ target_user_id: contactId }
		);
		throwIfError(error);
		return data;
	},

	getMessages: async (conversationId) => {
		const { data, error } = await supabase
			.from('messages')
			.select('id, sender_id, body, created_at')
			.eq('conversation_id', conversationId)
			.order('created_at');
		throwIfError(error);
		return data.map(toMessage);
	},

	sendMessage: async (conversationId, text) => {
		const { data, error } = await supabase
			.from('messages')
			.insert({
				conversation_id: conversationId,
				body: text,
			})
			.select('id, sender_id, body, created_at')
			.single();
		throwIfError(error);
		return toMessage(data);
	},

	subscribeToMessages: (conversationId, onMessage, onError) =>
		supabase
			.channel(`messages:${conversationId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `conversation_id=eq.${conversationId}`,
				},
				(payload) => onMessage(toMessage(payload.new))
			)
			.subscribe((status, error) => {
				if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
					onError(error || new Error('Live message updates are unavailable.'));
				}
			}),

	unsubscribe: (channel) => supabase.removeChannel(channel),
};
