import { aiService } from '../services/aiService';

export async function generateProposal(formData, profile) {
  return await aiService.generateProposalText(formData, profile);
}
