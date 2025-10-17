export interface WorkflowTemplate {
  name: string;
  description: string;
  payload: any; // matches Backend workflows table shape (minus bot_id)
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: 'Valve Product Inquiry',
    description: 'Share catalog link → collect product, quantity, email, address → save inquiry',
    payload: {
      name: 'Valve Product Inquiry',
      workflow_type: 'custom',
      status: 'published',
      is_active: true,
      trigger: { keywords: ['inquiry', 'product', 'catalog', 'valve'] },
      steps: [
        {
          id: 'step1',
          type: 'share_media',
          prompt_message: 'Here is our product catalog: https://example.com/valves-catalog\nWhich product are you interested in?',
          media: null,
          next: 'step2',
        },
        {
          id: 'step2',
          type: 'collect_field',
          prompt_message: 'Please enter the product name or code.',
          collect_config: { field_key: 'product' },
          next: 'step3',
        },
        {
          id: 'step3',
          type: 'collect_field',
          prompt_message: 'Great. What quantity do you need?',
          collect_config: { field_key: 'quantity' },
          next: 'step4',
        },
        {
          id: 'step4',
          type: 'collect_field',
          prompt_message: 'Please share your email address for the quotation.',
          collect_config: { field_key: 'email' },
          next: 'step5',
        },
        {
          id: 'step5',
          type: 'collect_field',
          prompt_message: 'Lastly, your shipping address (optional).',
          collect_config: { field_key: 'address' },
          // no next = finish
        },
      ],
      actions: [{ type: 'save_to_database' }],
      ai_context: {},
    },
  },
  {
    name: 'Salon Appointment (Basic)',
    description: 'Collect name → service → preferred time → confirmation. Saves inquiry for manual follow-up.',
    payload: {
      name: 'Salon Appointment (Basic)',
      workflow_type: 'custom',
      status: 'published',
      is_active: true,
      trigger: { keywords: ['book', 'appointment', 'salon', 'haircut'] },
      steps: [
        {
          id: 's1',
          type: 'collect_field',
          prompt_message: 'Welcome to our salon! May I have your name?',
          collect_config: { field_key: 'name' },
          next: 's2',
        },
        {
          id: 's2',
          type: 'show_options',
          prompt_message: 'Which service would you like?',
          options_config: {
            field_key: 'service',
            options: [
              { label: 'Haircut', value: 'haircut' },
              { label: 'Coloring', value: 'coloring' },
              { label: 'Styling', value: 'styling' },
            ],
          },
          next: 's3',
        },
        {
          id: 's3',
          type: 'collect_field',
          prompt_message: 'Preferred date/time? (e.g., 2025-10-20 3 PM)',
          collect_config: { field_key: 'preferred_time' },
          next: 's4',
        },
        {
          id: 's4',
          type: 'ai_response',
          prompt_message: 'Thanks! I will confirm availability shortly.',
          // Next omitted to end and save inquiry
        },
      ],
      actions: [{ type: 'save_to_database' }],
      ai_context: {},
    },
  },
];

