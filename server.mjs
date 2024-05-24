import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import admin from 'firebase-admin';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc, addDoc, getDoc, query, where } from 'firebase/firestore/lite';
import { register, login, logout } from './controllers/auth.mjs';
import { addCampaign, allCampaign, campaignById } from './controllers/campaign.mjs';
import { allReview, review } from './controllers/review.mjs';
import { addArticle, allArticles } from './controllers/article.mjs';
import 'firebase/firestore';
import { addDestination, allDestination } from './controllers/destination.mjs';
// import { verifyToken } from './middleware/verifyToken.mjs';

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 4000;

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
const auth = getAuth(fireInit);

// db: green

// middleware
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

app.get('/', async (req, res) => {
    return res.status(200).json({
        status: "success"
    })
})

// Route for auth
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

// Route for campaign
app.post('/campaign', addCampaign);
app.get('/campaigns', allCampaign);
app.get('/campaign/:id', campaignById);

// Route for people are talking
app.post('/review', review);
app.get('/reviews', allReview);

// Route for artikel
app.post('/article', addArticle);
app.get('/articles', allArticles);

// Destination
app.post('/destination', addDestination);
app.get('/destinations', allDestination);
app.post('/destination/comment', verifyToken, async (req, res) => {
    const { idDestination, comment } = req.body;
    const idUser = req.user.uid;
    const addCommentOnDestination = await addDoc(collection(db, 'comment_on_destination'), {
        idDestination: idDestination,
        idUser: idUser,
        comment: comment,
        createdAt: new Date()
    });
    return res.status(200).json({
        status: "success",
        message: "ok",
        data: {
            comment: {
                id: addCommentOnDestination.id,
                idDestination,
                idUser,
                comment,
                createdAt: new Date()
            }
        }
    });
});
app.get('/destination/:id', async (req, res) => {
    const destinationId = req.params.id;
    try {
        // get destination by id param
        const destinationDoc = await getDoc(doc(db, 'destinations', destinationId));
        if (!destinationDoc.exists()) {
            return res.status(404).json({
                error: "Destination not found"
            });
        }
        const destinationData = destinationDoc.data();
        const idCampaign = destinationData.idCampaign;
        
        // get campaign by idCampaign in destination
        let campaignData = null;
        if (idCampaign !== null) {
            const campaignDoc = await getDoc(doc(db, 'campaigns', idCampaign));
            if (!campaignDoc.exists()) {
                return res.status(404).json({
                    error: "Campaign not found"
                });
            }
            campaignData = campaignDoc.data();
        }

        // get all comment where idDestination is same as param
        const comments_on_destination = []
        const commentsRef = collection(db, "comment_on_destination");
        const q = query(commentsRef, where("idDestination", "==", destinationId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt;
            const date = createdAt.toDate();
            data.createdAt = date.toISOString();
            // console.log("data => ", data);
            comments_on_destination.push(data);
        });

        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                detailDestination: {
                    ...destinationData,
                    campaign: campaignData,
                    comments: comments_on_destination,
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

// See Own Profile
app.get('/me', verifyToken, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "ok",
        data: {
            user: req.user
        }
    });
});

// Authorization route
app.get('/authorize', verifyToken, (req, res) => {
    res.status(200).json({ message: 'User is authorized', user: req.user.id });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
