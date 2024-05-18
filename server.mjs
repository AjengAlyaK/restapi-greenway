import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import admin from 'firebase-admin';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore/lite';
// import { serviceKey } from '../serviceKey.json' assert { type: "json" };
// import { fireConfig } from './config';

const app = express();
app.use(bodyParser.json());

const port = 4000;

// const firebaseConfig = fireConfig;

const fireInit = initializeApp({
    apiKey: "AIzaSyAxWdJ-mNMjucjnVhv2821_nP5mVYPFS_k",
    authDomain: "mostgreen.firebaseapp.com",
    projectId: "mostgreen",
    storageBucket: "mostgreen.appspot.com",
    messagingSenderId: "415391017886",
    appId: "1:415391017886:web:2d5ba7e2dc3cb2b971448f"
});

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "mostgreen",
        "private_key_id": "05e0971d8c2ac6b79297303a92f1d42482fe3bf4",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUVn4roNlOCuvV\nd2Qg0JTP89kXQ9ffcIFTzij+nHGOe1AbtflZsUa7S1XraCARQYc3ElgQJfoIedoP\ngXgP0CGlrCJ1ISAfJxT3oiAmwxtrvVygf2CWqLVQ/7YS/lJRRSvy8515UKerPmtd\nSe9VQFJoFZQcVZlBGklm1Hm9uCl+rdFQwATRkhZD2rhMVmtYlGz3e0a32rM2/1FV\nh4UxrsGW+r/F45RcDb89bhosRf8Yc17pT4J4lujDVVZvrt498tiPWsWKNQUKbb+t\nJeneadFdyLzuwftXf1EchxzExqqP+MOohOZiafc/GggnQqKvtX8unHGh+YgtMeSQ\nPI8gHAr5AgMBAAECggEADDwkFPoj4k2BTS6XSiOaGprczY/xdsMDT8PB2tpRfXSL\nU3XLdsvp7xnUIOIKPxIeEntHWzGesWNHip7dpcQ/ejg78VhFm3wwPQqYx0mxcc4B\nHVXURCjvJ5qnzGJArOZdLSFN3Es8QSIZXezyuh/fjCk3eazPwrBl3H7q+ax+c63H\nUiL48BIRv9EmNcUqIBtQaEQb1UMwfApVF/01Fi3K+OBBHd6nyFzGzrAZeXxM04r0\n4ZC5BXHHl0He1tMrk09kZAwPnUeLwcic9Zy4Bt3lzpZN8n80bjnIJ1npCQ6FAQD9\nTrg8qHzJDcx/endfRoi0KIqILpTP3+QPg6DjDg3E3wKBgQDOgz5cE3R3al9iM2m4\nw+Wh8BskljudM90XmdMB+52lme3UhSE9r9vSoaW6FPWqW8SHLVxi3W5xNC11i4e4\n4gwSNUWqmN2LOg2XCbSEdYDC6COllPdMquYfxozfZH3XBc1rs6dSXdesn1ryXNJJ\nIZNcUSn9lQ4zGYMJjhtF09fjVwKBgQC34nLzWt/NODR2SB+7ZoKtZt/hR2/JQX2f\nU7zL++RM5wqZRLNjuCBw0Da264p5KedMZwegOcX7YbdraFT4fLMAcNc/G+j2I84R\nX9pcdHInLoeh1p+QsvtZrffCPmuJqIbfxc/lrZlYl0pU5ghcfvSpivxaSB5XGo2d\nJfZAd95iLwKBgDldkcwIB3lIjjh8KakOmdJTHWcbaHHxvz/YFhpd59vhl4RKewJk\nwH6RMrUvL1LkbQJT4m8ALba6lMorOUdtW4cPT0vlbN1JAg9rvb5x2ZPK4mQTrmKY\nspYvFGDVzHMXhImffSJPOSMVnTDoAe4YqpOhZDWx2yDsvE7CL+dEwpq/AoGAEvQJ\nSyILvVhUt/hZJPS89WiMHOlDEWhprVlxNUlCT9bklcWqA9Y/qcEcUqBWhoSWLZ7U\n/2PVD0MUJ8L6Nx6LSLlYxk13Jp+sJshNdogeGAHIwxqfGcgI9kZjKidK6EZxmHEI\nK7FIBAScCcIoDHideTg1KI0Ua3/2JsN57U0to8sCgYEAoW7AyfDt/CwyTb3XYG+n\nxTsWpau6wdTQhKmXM9hFye93ZrMzHkD1gnhJOj7E0nLZ/Uq6m5ILp6fy+Mel71T0\nutsfj7X4OUJ7qBpw2ZQtbs75+BES+/pyLJo6Q9/4bRguKyKfd5DSEfk8Dja/PRhe\na2Ky/tXaMOMieKgFnu+qTZw=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-i4bt1@mostgreen.iam.gserviceaccount.com",
        "client_id": "116120951821913259334",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-i4bt1%40mostgreen.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }),
});

const db = getFirestore(fireInit);

const auth = getAuth();

// db: green
app.get('/', async (req, res) => {
    return res.status(200).json({
        status: "success"
    })
})

// Route for signing in
app.post('/register', async (req, res) => {
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
});

app.post('/login', async (req, res) => {
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
});

app.post('/logout', async (req, res) => {
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
})

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ error: 'Unauthorized' });
    }
};

// Authorization route
app.get('/authorize', verifyToken, (req, res) => {
    res.status(200).json({ message: 'User is authorized', user: req.user });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
