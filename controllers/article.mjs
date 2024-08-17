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

export const addArticle = async (req, res) => {
    const { title, picture, link } = req.body;

    if (!title || !picture || !link) {
        return res.status(400).json({ error: "title, picture, and link are required." });
    }

    try {
        const addArticle = await addDoc(collection(db, "articles"), {
            title: title,
            picture: picture,
            link: link
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                article: {
                    id: addArticle.id,
                    title,
                    picture,
                    link
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

export const deleteArticle = async (req, res) => {
    const articleId = req.params.id;

    if (!articleId) {
        return res.status(400).json({ error: "articleId is required." });
    }

    try {
        const articleRef = doc(db, 'articles', articleId);
        const articleDoc = await getDoc(articleRef);
        if (!articleDoc.exists()) {
            return res.status(404).json({ error: "Article not found." });
        }
        await deleteDoc(doc(db, "articles", articleId));
        return res.status(200).json({
            status: "success",
            message: "Article deleted successfully",
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

export const updateArticle = async (req, res) => {
    const articleId = req.params.id;
    const { title, picture, link } = req.body;

    if (!title || !picture || !link) {
        return res.status(400).json({ error: "title, picture, and link are required." });
    }

    try {
        const articleRef = doc(db, "articles", articleId);
        await updateDoc(articleRef, {
            title, 
            picture, 
            link
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                article: {
                    id: articleId,
                    title,
                    picture,
                    link
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

export const allArticles = async (req, res) => {
    try {
        const articles = collection(db, 'articles');
        const articleSnapshot = await getDocs(articles);
        const articleList = articleSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                articles: articleList
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