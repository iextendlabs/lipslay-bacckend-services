const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

async function sendPushNotification({ deviceToken, title, body }) {
    if (!deviceToken) return 'No device token provided.';
    try {
        const serviceAccountFile = path.join(__dirname, '../../config/firebase-service-account.json');
        const scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
        const auth = new google.auth.GoogleAuth({
            keyFile: serviceAccountFile,
            scopes,
        });
        const accessToken = await auth.getAccessToken();
        const url = 'https://fcm.googleapis.com/v1/projects/sallon-9a41d/messages:send';
        const data = {
            message: {
                token: deviceToken,
                notification: { title, body },
                apns: {
                    payload: {
                        aps: { 'content-available': 1, priority: 'high' }
                    }
                },
                android: { priority: 'high' }
            }
        };
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.status === 200) {
            return 'Notification sent successfully.';
        } else {
            return `Failed to send notification. FCM Response: ${response.data}`;
        }
    } catch (e) {
        return `Error sending notification: ${e.message}`;
    }
}

module.exports = { sendPushNotification };
