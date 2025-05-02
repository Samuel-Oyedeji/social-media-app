export async function sendEmail(to: string, subject: string, text: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('Resend API key is missing. Please add it to .env.local.');
    console.debug('Environment debug info:', {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      processEnvKeys: Object.keys(process.env).filter(key => key.startsWith('RESEND') || key.startsWith('NEXT_PUBLIC')),
      isClient: typeof window !== 'undefined',
    });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'YourApp <no-reply@socialcontent.onresend.com>',
        to,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.statusText} - ${errorText}`);
    }

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}