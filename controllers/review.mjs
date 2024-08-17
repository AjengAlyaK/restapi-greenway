import { initializeApp } from 'firebase/app';
import { getFirestore, doc, addDoc, deleteDoc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyAxWdJ-mNMjucjnVhv2821_nP5mVYPFS_k",
    authDomain: "mostgreen.firebaseapp.com",
    projectId: "mostgreen",
    storageBucket: "mostgreen.appspot.com",
    messagingSenderId: "415391017886",
    appId: "1:415391017886:web:2d5ba7e2dc3cb2b971448f"
};

const fireInit = initializeApp(firebaseConfig);
const db = getFirestore(fireInit);

export const review = async (req, res) => {
    const { name, review, photo, occupation } = req.body;

    if (!name || !review || !photo || !occupation) {
        return res.status(400).json({ error: "name, review, photo and occupation are required." });
    }

    try {
        const addReview = await addDoc(collection(db, "reviews"), {
            name: name,
            review: review,
            photo: photo,
            occupation: occupation
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
                    occupation
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

export const deleteReview = async (req, res) => {
    const reviewId = req.params.id;

    if (!reviewId) {
        return res.status(400).json({ error: "reviewId is required." });
    }

    try {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewRef);
        if (!reviewDoc.exists()) {
            return res.status(404).json({ error: "Review not found." });
        }
        await deleteDoc(doc(db, "reviews", reviewId));
        return res.status(200).json({
            status: "success",
            message: "Review deleted successfully",
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

export const updateReview = async (req, res) => {
    const reviewId = req.params.id;
    const { name, review, photo, occupation } = req.body;

    if (!name || !review || !photo || !occupation) {
        return res.status(400).json({ error: "name, review, photo and occupation are required." });
    }

    try {
        const reviewRef = doc(db, "reviews", reviewId);
        await updateDoc(reviewRef, {
            name,
            review,
            photo,
            occupation
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                review: {
                    id: reviewId,
                    name,
                    review,
                    photo,
                    occupation
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