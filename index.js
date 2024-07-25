import functions from 'firebase-functions';
import admin from 'firebase-admin'

admin.initializeApp();

const db = admin.firestore();

export const checkUserExists3 = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { email, password_hash } = req.body;

    if (!email || !password_hash) {
        res.status(400).send('Email and password_hash are required');
        return;
    }

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).where('password_hash', '==', password_hash).get();

        if (snapshot.empty) {
            res.status(403).send({ exists: false });
        } else {
            res.status(200).send({ exists: true });
        }
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).send('Internal Server Error');
    }
});