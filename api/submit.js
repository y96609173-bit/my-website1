// Vercel Serverless Function: api/submit.js
// Handles secure project brief submission, server-side validation, XSS sanitization, and spam honeypot filters.

function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

module.exports = async (req, res) => {
    // Enable CORS and headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
        return;
    }

    try {
        const body = req.body || {};

        // 1. Honeypot Spam Protection
        if (body.website_url && body.website_url.trim() !== '') {
            console.log('Spam bot detected via honeypot field website_url.');
            // Return 200 Success to fool the spam bot into thinking it succeeded
            res.status(200).json({ success: true, message: 'Received (filtered)' });
            return;
        }

        // 2. Extract and Sanitize Form Inputs
        const rawName = body.fullName || '';
        const rawPhone = body.phoneNumber || '';
        const rawEmail = body.emailAddress || '';
        const rawCompany = body.companyName || '';
        const rawService = body.requestedService || '';
        const rawDesc = body.projectDesc || '';
        const rawBudget = body.projectBudget || 'أحتاج إلى مناقشة الميزانية';
        const rawTimeline = body.projectTimeline || 'غير محدد';
        const rawContact = body.contactMethod || 'WhatsApp';

        const data = {
            fullName: sanitize(rawName),
            phoneNumber: sanitize(rawPhone),
            emailAddress: sanitize(rawEmail),
            companyName: sanitize(rawCompany),
            requestedService: sanitize(rawService),
            projectDesc: sanitize(rawDesc),
            projectBudget: sanitize(rawBudget),
            projectTimeline: sanitize(rawTimeline),
            contactMethod: sanitize(rawContact)
        };

        // 3. Server-side Validation
        const errors = {};

        if (!data.fullName || data.fullName.length < 2) {
            errors.fullName = 'الرجاء كتابة الاسم الكامل (حرفين على الأقل).';
        }

        // Saudi Mobile Validation: starts with 05 followed by 8 digits (total 10 digits)
        const saudiPhoneRegex = /^05[0-9]{8}$/;
        if (!data.phoneNumber || !saudiPhoneRegex.test(data.phoneNumber)) {
            errors.phoneNumber = 'الرجاء إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام.';
        }

        if (data.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailAddress)) {
            errors.emailAddress = 'صيغة البريد الإلكتروني غير صحيحة.';
        }

        const validServices = ['تصميم هوية بصرية', 'تصميم شعار', 'تصميم موقع إلكتروني', 'تطوير موقع إلكتروني', 'تصميم محتوى بصري', 'أخرى'];
        if (!data.requestedService || !validServices.includes(data.requestedService)) {
            errors.requestedService = 'الرجاء اختيار الخدمة المطلوبة من القائمة.';
        }

        if (!data.projectDesc || data.projectDesc.length < 10) {
            errors.projectDesc = 'الرجاء كتابة نبذة توضيحية عن مشروعك (10 أحرف على الأقل).';
        }

        if (Object.keys(errors).length > 0) {
            res.status(400).json({ success: false, errors });
            return;
        }

        console.log('Valid project brief inquiry received:', data);

        let sentNotification = false;

        // --- NOTIFICATION METHOD A: DISCORD WEBHOOK ---
        if (process.env.DISCORD_WEBHOOK_URL) {
            try {
                const payload = {
                    username: "Brief Studio Notification",
                    avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
                    embeds: [{
                        title: "💼 طلب مشروع جديد (New Project Inquiry)",
                        color: 11043884, // Equivalent to Goldish brass tone #A8842C
                        fields: [
                            { name: "الاسم الكامل", value: data.fullName, inline: true },
                            { name: "رقم الجوال", value: data.phoneNumber, inline: true },
                            { name: "البريد الإلكتروني", value: data.emailAddress || "غير متوفر", inline: true },
                            { name: "الشركة / المشروع", value: data.companyName || "غير متوفر", inline: true },
                            { name: "الخدمة المطلوبة", value: data.requestedService, inline: true },
                            { name: "الميزانية التقريبية", value: data.projectBudget, inline: true },
                            { name: "تاريخ البدء المفضل", value: data.projectTimeline, inline: true },
                            { name: "طريقة التواصل المفضلة", value: data.contactMethod, inline: true },
                            { name: "نبذة عن المشروع", value: data.projectDesc }
                        ],
                        timestamp: new Date().toISOString(),
                        footer: { text: "Digital Brief System 2026" }
                    }]
                };

                const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    sentNotification = true;
                    console.log('Discord webhook sent successfully.');
                } else {
                    console.error('Discord webhook returned status:', response.status);
                }
            } catch (err) {
                console.error('Error sending Discord webhook:', err);
            }
        }

        // --- NOTIFICATION METHOD B: TELEGRAM BOT ---
        if (!sentNotification && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
                const message = `💼 *طلب مشروع جديد (New Project Inquiry)*\n\n` +
                                `*الاسم:* ${data.fullName}\n` +
                                `*الجوال:* ${data.phoneNumber}\n` +
                                `*البريد:* ${data.emailAddress || "غير متوفر"}\n` +
                                `*المشروع:* ${data.companyName || "غير متوفر"}\n` +
                                `*الخدمة:* ${data.requestedService}\n` +
                                `*الميزانية:* ${data.projectBudget}\n` +
                                `*الوقت:* ${data.projectTimeline}\n` +
                                `*التواصل المفضل:* ${data.contactMethod}\n\n` +
                                `*نبذة عن المشروع:*\n${data.projectDesc}`;

                const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });

                if (response.ok) {
                    sentNotification = true;
                    console.log('Telegram message sent successfully.');
                } else {
                    console.error('Telegram API returned status:', response.status);
                }
            } catch (err) {
                console.error('Error sending Telegram message:', err);
            }
        }

        // --- NOTIFICATION METHOD C: SMTP / EMAIL ---
        if (!sentNotification && process.env.SMTP_HOST) {
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_PORT === '465',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                const mailOptions = {
                    from: `"Brief Studio System" <${process.env.SMTP_USER}>`,
                    to: process.env.TO_EMAIL || process.env.SMTP_USER,
                    subject: `💼 طلب مشروع جديد - ${data.fullName}`,
                    html: `
                        <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; line-height: 1.6;">
                            <h2 style="border-bottom: 2px solid #A8842C; padding-bottom: 10px; color: #111;">💼 طلب مشروع جديد (Project Brief)</h2>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; width: 180px;">الاسم الكامل:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.fullName}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">رقم الجوال:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.phoneNumber}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">البريد الإلكتروني:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.emailAddress || "غير متوفر"}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">اسم الشركة / المشروع:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.companyName || "غير متوفر"}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">الخدمة المطلوبة:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.requestedService}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">الميزانية التقريبية:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.projectBudget}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">الوقت المفضل للبدء:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.projectTimeline}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">طريقة التواصل المفضلة:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${data.contactMethod}</td></tr>
                            </table>
                            <h3 style="margin-top: 20px; color: #111;">نبذة عن المشروع:</h3>
                            <div style="background-color: #f7f6f2; padding: 15px; border-radius: 4px; border: 1px solid #eee;">
                                ${data.projectDesc.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                sentNotification = true;
                console.log('SMTP email sent successfully.');
            } catch (err) {
                console.error('Error sending SMTP email:', err);
            }
        }

        // 4. Send Response
        res.status(200).json({
            success: true,
            message: 'Inquiry processed successfully.',
            notificationSent: sentNotification
        });

    } catch (error) {
        console.error('Serverless execution exception:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء معالجة الطلب.' });
    }
};
