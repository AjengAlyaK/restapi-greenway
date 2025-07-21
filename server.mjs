import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import admin from 'firebase-admin';
import 'firebase/firestore';
import { register, login, logout } from './controllers/auth.mjs';
import { addCampaign, allCampaign, campaignById, deleteCampaign, updateCampaign } from './controllers/campaign.mjs';
import { allReview, deleteReview, review, updateReview } from './controllers/review.mjs';
import { addArticle, allArticles, deleteArticle, updateArticle } from './controllers/article.mjs';
import { addDestination, allDestination, commentOnDestination, updateCommentOnDestination, deleteCommentOnDestination, deleteDestination, destinationById, updateDestination } from './controllers/destination.mjs';
import { addDiscussion, allDiscussion, commentOnDiscussion, deleteCommentOnDiscussion, deleteDiscussion, discussionById, downVotesCommentOnDiscussion, downVotesOnDiscussion, netralVotesCommentOnDiscussion, netralVotesOnDiscussion, upVotesCommentOnDiscussion, upVotesOnDiscussion } from './controllers/discussion.mjs';
import { addAboutUs, allAboutUs, deleteAboutUs, updateAboutUs } from './controllers/aboutUs.mjs';

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
const port = 4000;

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

const setAdmin = async (uid) => {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
};

// Call this function with the UID of the user you want to make an admin
setAdmin('ksiitY4bPiah3N3utYKm7O8zSIK2');

const authenticateAdmin = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(403).send('Unauthorized: no token');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await admin.auth().getUser(decodedToken.uid);

        if (user.customClaims && user.customClaims.admin === true) {
            req.user = user;
            next();
        } else {
            return res.status(403).send('Unauthorized: u r not admin');
        }
    } catch (error) {
        return res.status(403).send('Unauthorized: idk why');
    }
};

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
app.post('/campaign', authenticateAdmin, addCampaign);
app.get('/campaigns', allCampaign);
app.get('/campaign/:id', campaignById);
app.delete('/campaign/:id', authenticateAdmin, deleteCampaign);
app.put('/campaign/:id', authenticateAdmin, updateCampaign);

// Route for people are talking
app.post('/review', authenticateAdmin, review);
app.get('/reviews', allReview);
app.delete('/review/:id', authenticateAdmin, deleteReview);
app.put('/review/:id', authenticateAdmin, updateReview);

// Route for artikel
app.post('/article', authenticateAdmin, addArticle);
app.get('/articles', allArticles);
app.delete('/article/:id', authenticateAdmin, deleteArticle);
app.put('/article/:id', authenticateAdmin, updateArticle);

// Destination
app.post('/destination', authenticateAdmin, addDestination);
app.get('/destinations', allDestination);
app.get('/destination/:id', destinationById);
app.post('/destination/:id/comment', verifyToken, commentOnDestination);
app.delete('/destination/:id/comment/:commentId', verifyToken, deleteCommentOnDestination);
app.patch('/destination/:id/comment/:commentId', verifyToken, updateCommentOnDestination);
app.delete('/destination/:id', authenticateAdmin, deleteDestination);
app.put('/destination/:id', authenticateAdmin, updateDestination);

// Discussion
app.post('/discussion', verifyToken, addDiscussion);
app.delete('/discussion/:id', verifyToken, deleteDiscussion);
app.get('/discussions', allDiscussion);
app.post('/discussion/:id/up-votes', verifyToken, upVotesOnDiscussion);
app.post('/discussion/:id/down-votes', verifyToken, downVotesOnDiscussion);
app.post('/discussion/:id/netral-votes', verifyToken, netralVotesOnDiscussion);
app.post('/discussion/:id/comment', verifyToken, commentOnDiscussion);
app.delete('/discussion/:id/comment/:commentId', verifyToken, deleteCommentOnDiscussion);
app.get('/discussion/:id', discussionById);
app.post('/discussion/:id/comment/:id/up-votes', verifyToken, upVotesCommentOnDiscussion);
app.post('/discussion/:id/comment/:id/down-votes', verifyToken, downVotesCommentOnDiscussion);
app.post('/discussion/:id/comment/:id/netral-votes', verifyToken, netralVotesCommentOnDiscussion);

// About Us
app.post('/about-us', authenticateAdmin, addAboutUs);
app.get('/about-us', allAboutUs);
app.delete('/about-us/:id', authenticateAdmin, deleteAboutUs);
app.put('/about-us/:id', authenticateAdmin, updateAboutUs);

// See Own Profile
app.get('/me', verifyToken, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "ok",
        data: {
            user: req.user.name,
            id: req.user.uid
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
