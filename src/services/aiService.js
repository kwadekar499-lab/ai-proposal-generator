import { insforge } from '../lib/insforge';

export const aiService = {
  async generateProposalText(formData, profile) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `Write a highly detailed, professional digital marketing proposal in Markdown format:

Agency/Freelancer Name: ${profile?.name || 'Agency Lead'}
Agency Name: ${profile?.businessName || 'Digital Agency'}
Services Offered: ${profile?.services || 'Digital Strategy'}
Email: ${profile?.email || 'contact@agency.com'}

Client Name: ${formData.clientName}
Client Location: ${formData.clientLocation}
Project Type: ${formData.projectType}
Deliverables/Pages: ${formData.pages} unit(s)
Investment Amount: $${formData.price} USD
Estimated Timeline: ${formData.timeline}
Client Brief: "${formData.description}"
Date: ${date}
Valid Until: ${validUntil}

Format output with clean markdown headers (##), bold text, bullet points, and markdown tables. Do not include markdown code block syntax wrappers (\`\`\`markdown).`;

    const completion = await insforge.ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert sales proposal writer for agencies and freelancers.' },
        { role: 'user', content: prompt }
      ]
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('AI service did not return content.');
    }

    return completion.choices[0].message.content;
  }
};
