interface SupportMessage {
  userId: string;
  userEmail: string;
  userName: string;
  category: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
}

// Email service for support messages
export const sendSupportMessage = async (supportData: SupportMessage): Promise<void> => {
  // Send to both email and Telegram as requested
  const emailData = {
    to_email: import.meta.env.VITE_ADMIN_EMAIL || 'oladoyeheritage445@gmail.com',
    from_name: supportData.userName,
    from_email: supportData.userEmail,
    subject: `[SUPPORT] ${supportData.category.toUpperCase()} - ${supportData.subject}`,
    message: formatSupportMessage(supportData),
    priority: supportData.priority,
    timestamp: supportData.timestamp.toISOString()
  };

  const promises: Promise<void>[] = [];

  // Add email sending to promises
  promises.push(mockEmailService(emailData));
  
  // Add Telegram sending to promises if configured
  if (import.meta.env.VITE_TELEGRAM_BOT_TOKEN && import.meta.env.VITE_TELEGRAM_CHAT_ID) {
    promises.push(sendToTelegram(supportData));
  }

  try {
    // Send to both email and Telegram simultaneously
    await Promise.allSettled(promises);
    console.log('Support message sent to all configured channels');
  } catch (error) {
    console.error('Error sending support message:', error);
    throw error;
  }
};

const formatSupportMessage = (data: SupportMessage): string => {
  const priorityEmojis = {
    low: '🟢',
    medium: '🟡', 
    high: '🟠',
    urgent: '🔴'
  };

  return `
🆘 NEW SUPPORT REQUEST

👤 User: ${data.userName}
📧 Email: ${data.userEmail}
🆔 User ID: ${data.userId}

📂 Category: ${data.category.toUpperCase()}
${priorityEmojis[data.priority]} Priority: ${data.priority.toUpperCase()}
📝 Subject: ${data.subject}

💬 Message:
${data.message}

🕒 Submitted: ${data.timestamp.toLocaleString()}

---
Sent from LAUTECH Economics '29 Portal
  `.trim();
};

// Telegram bot integration (when bot details are provided)
const sendToTelegram = async (supportData: SupportMessage): Promise<void> => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.warn('Telegram bot details not configured');
    return;
  }

  const message = formatTelegramMessage(supportData);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${response.status} - ${errorData.description || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Support message sent to Telegram successfully:', result);
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    // Don't throw error here - email should still work even if Telegram fails
  }
};

const formatTelegramMessage = (data: SupportMessage): string => {
  const priorityEmojis = {
    low: '🟢',
    medium: '🟡', 
    high: '🟠',
    urgent: '🔴'
  };

  return `
<b>🆘 NEW SUPPORT REQUEST</b>

<b>👤 User:</b> ${data.userName}
<b>📧 Email:</b> ${data.userEmail}
<b>🆔 User ID:</b> <code>${data.userId}</code>

<b>📂 Category:</b> ${data.category.toUpperCase()}
<b>${priorityEmojis[data.priority]} Priority:</b> ${data.priority.toUpperCase()}
<b>📝 Subject:</b> ${data.subject}

<b>💬 Message:</b>
${data.message}

<b>🕒 Submitted:</b> ${data.timestamp.toLocaleString()}

<i>Sent from LAUTECH Economics '29 Portal</i>
  `.trim();
};

// Mock email service - replace with actual email service in production
const mockEmailService = async (emailData: any): Promise<void> => {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, replace this with actual email service like:
  // - EmailJS: emailjs.send(serviceId, templateId, emailData)
  // - SendGrid: await sgMail.send(emailData)
  // - Nodemailer: await transporter.sendMail(emailData)
  
  console.log('📧 Email sent (mock):', emailData);
  
  // Simulate occasional failures for testing
  if (Math.random() < 0.1) {
    throw new Error('Mock email service failure');
  }
};

// Utility function to validate Telegram bot configuration
export const validateTelegramConfig = (): boolean => {
  return !!(import.meta.env.VITE_TELEGRAM_BOT_TOKEN && import.meta.env.VITE_TELEGRAM_CHAT_ID);
};

// Test function to verify Telegram bot connectivity
export const testTelegramBot = async (): Promise<boolean> => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  
  if (!botToken) return false;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
};