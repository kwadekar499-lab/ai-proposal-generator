import { insforge } from '../lib/insforge';

export const profileService = {
  async getProfile(userId) {
    if (!userId) return null;
    const { data, error } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      businessName: data.business_name || '',
      services: data.services || '',
    };
  },

  async saveProfile(userId, profileData) {
    if (!userId) throw new Error('User authentication required to save profile');

    const payload = {
      id: userId,
      name: profileData.name || '',
      email: profileData.email || '',
      business_name: profileData.businessName || '',
      services: profileData.services || '',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await insforge.database
      .from('profiles')
      .upsert([payload])
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data?.id || userId,
      name: data?.name || payload.name,
      email: data?.email || payload.email,
      businessName: data?.business_name || payload.business_name,
      services: data?.services || payload.services,
    };
  }
};
