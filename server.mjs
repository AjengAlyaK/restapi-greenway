import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from "firebase/auth";
import fireConfing from './config';

const app = express();
app.use(bodyParser.json());

const port = 4000;

const firebaseConfig = fireConfing;

const fireInit = initializeApp(firebaseConfig);

const auth = getAuth();

// Route for signing in
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide name, email, and password" });
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(auth.currentUser, { displayName: name });
        return res.status(200).json({
            message: "User signed in successfully",
            data: {
                name: name
            }
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        return res.status(400).json({ errorCode, errorMessage });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        const displayName = user.displayName;
        return res.status(200).json({
            message: "User logged in successfully",
            data: {
                name: displayName
            }
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        return res.status(401).json({ error: errorMessage });
    }
});

app.post('/logout', async (req, res) => {
    try {
        await signOut(auth);

        console.log("User signed out");

        return res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        const errorCode  = error.code;
        const errorMessage = error.message;
        console.error("Logout error:", errorCode, errorMessage);
        return res.status(500).json({ error: errorMessage});
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
