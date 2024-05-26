import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc, addDoc, collection, getDocs, getDoc } from 'firebase/firestore/lite';
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

export const review = async (req, res) => {
    const { name, review, photo, job } = req.body;
    // Validate required fields
    if (!name || !review || !photo || !job) {
        return res.status(400).json({ error: "name, review, photo, job are required." });
    }
    try {
        const addReview = await addDoc(collection(db, "reviews"), {
            name: name,
            review: review,
            photo: photo,
            job: job
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                review: {
                    id: addReview.id,
                    name,
                    review,
                    photo,
                    job
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
};

export const allReview = async (req, res) => {
    try {
        const reviews = collection(db, 'reviews');
        const reviewSnapshot = await getDocs(reviews);
        const reviewList = reviewSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                reviews: reviewList
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