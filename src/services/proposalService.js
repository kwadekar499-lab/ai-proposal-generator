import { insforge } from '../lib/insforge';

export const proposalService = {
  async getProposals(userId) {
    if (!userId) return [];

    const { data, error } = await insforge.database
      .from('proposals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(item => ({
      id: item.id.toString(),
      userId: item.user_id,
      clientName: item.client_name,
      clientLocation: item.client_location || '',
      projectType: item.project_type,
      pages: item.pages || 1,
      price: item.price || 0,
      timeline: item.timeline || '',
      description: item.description || '',
      content: item.content || '',
      status: item.status || 'Generated',
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '',
      createdAt: item.created_at
    }));
  },

  async createProposal(userId, proposalData) {
    if (!userId) throw new Error('User authentication required to save proposal');

    const record = {
      user_id: userId,
      client_name: proposalData.clientName,
      client_location: proposalData.clientLocation || '',
      project_type: proposalData.projectType,
      pages: Number(proposalData.pages || 1),
      price: Number(proposalData.price || 0),
      timeline: proposalData.timeline || '',
      description: proposalData.description || '',
      content: proposalData.content,
      status: proposalData.status || 'Generated',
    };

    const { data, error } = await insforge.database
      .from('proposals')
      .insert([record])
      .select('*')
      .single();

    if (error) throw error;

    const item = data || record;
    return {
      id: (item.id || Date.now()).toString(),
      userId: item.user_id || userId,
      clientName: item.client_name || proposalData.clientName,
      clientLocation: item.client_location || proposalData.clientLocation,
      projectType: item.project_type || proposalData.projectType,
      pages: item.pages || proposalData.pages,
      price: item.price || proposalData.price,
      timeline: item.timeline || proposalData.timeline,
      description: item.description || proposalData.description,
      content: item.content || proposalData.content,
      status: item.status || 'Generated',
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  },

  async updateProposal(id, content) {
    const { data, error } = await insforge.database
      .from('proposals')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async deleteProposal(id) {
    const { error } = await insforge.database
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
