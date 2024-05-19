import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc } from 'firebase/firestore/lite';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyAxWdJ-mNMjucjnVhv2821_nP5mVYPFS_k",
    authDomain: "mostgreen.firebaseapp.com",
    projectId: "mostgreen",
    storageBucket: "mostgreen.appspot.com",
    messagingSenderId: "415391017886",
    appId: "1:415391017886:web:2d5ba7e2dc3cb2b971448f"
};

const fireInit = initializeApp(firebaseConfig);
const auth = getAuth(fireInit);
const db = getFirestore(fireInit);

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide name, email, and password" });
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(auth.currentUser, { displayName: name });
        await setDoc(doc(db, 'users', user.uid), {
            // uid: user.uid,
            email: user.email,
            displayName: name,
            createdAt: new Date(),
        });
        return res.status(200).json({
            status: "success",
            message: "User created",
            data: {
                user: {
                    id: user.uid,
                    name: name,
                    email: user.email,
                }
            }
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        return res.status(400).json({
            error: {
                errorCode,
                errorMessage
            }
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;
        const accessToken = user.stsTokenManager.accessToken;

        // const displayName = user.displayName;
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                token: accessToken
            }
        });
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        return res.status(401).json({ error: errorMessage });
    }
}

export const logout = async (req, res) => {
    try {
        await signOut(auth);

        console.log("User signed out");

        return res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Logout error:", errorCode, errorMessage);
        return res.status(500).json({ error: errorMessage });
    }
}
