import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import fireConfing from './config';

const app = express();
app.use(bodyParser.json());

const port = 4000;

const firebaseConfig = fireConfing;

const fireInit = initializeApp(firebaseConfig);

const auth = getAuth();

// Route for signing in
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Additional logic upon successful sign in
        res.status(200).json({ message: "User signed in successfully", user });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(400).json({ errorCode, errorMessage });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
