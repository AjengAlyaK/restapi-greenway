import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc, addDoc, collection, getDocs, getDoc, query, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore/lite';
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

export const addDiscussion = async (req, res) => {
    const { title, category, body } = req.body;
    const idUser = req.user.uid;
    const upVotesBy = [];
    const downVotesBy = [];
    try {
        const addDiscussion = await addDoc(collection(db, 'discussions'), {
            idUser: idUser,
            title: title,
            category: category,
            body: body,
            upVotesBy: upVotesBy,
            downVotesBy: downVotesBy,
            createdAt: new Date()
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                discussion: {
                    id: addDiscussion.id,
                    idUser,
                    title,
                    category,
                    body,
                    upVotesBy,
                    downVotesBy,
                    createdAt: new Date()
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

export const allDiscussion = async (req, res) => {
    try {
        const discussions = collection(db, 'discussions');
        const discussionSnapshot = await getDocs(discussions);
        const discussionList = discussionSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            let formattedCreatedAt = '';

            if (createdAt && createdAt.seconds) {
                // Firestore Timestamp to JavaScript Date object
                const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
                // Format the date to ISO 8601 string
                formattedCreatedAt = date.toISOString();
            }

            return {
                id: doc.id,
                idUser: data.idUser,
                title: data.title,
                category: data.category,
                body: data.body,
                createdAt: formattedCreatedAt
            };
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                discussions: discussionList
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

export const upVotesOnDiscussion = async (req, res) => {
    const discussionId = req.params.id;

    if (!discussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Discussion ID is required."
        });
    }

    const discussionRef = doc(db, "discussions", discussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const discussionDoc = await getDoc(discussionRef);

        if (!discussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Discussion not found."
            });
        }

        await updateDoc(discussionRef, {
            upVotesBy: arrayUnion(voter),
            downVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            status: "success",
            message: "Discussion upvoted",
            data: {
                vote: {
                    discussionId: discussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};

export const downVotesOnDiscussion = async (req, res) => {
    const discussionId = req.params.id;

    if (!discussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Discussion ID is required."
        });
    }

    const discussionRef = doc(db, "discussions", discussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const discussionDoc = await getDoc(discussionRef);

        if (!discussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Discussion not found."
            });
        }

        await updateDoc(discussionRef, {
            downVotesBy: arrayUnion(voter),
            upVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            "status": "success",
            "message": "Discussion downvoted",
            data: {
                vote: {
                    discussionId: discussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};

export const netralVotesOnDiscussion = async (req, res) => {
    const discussionId = req.params.id;

    if (!discussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Discussion ID is required."
        });
    }

    const discussionRef = doc(db, "discussions", discussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const discussionDoc = await getDoc(discussionRef);

        if (!discussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Discussion not found."
            });
        }

        await updateDoc(discussionRef, {
            upVotesBy: arrayRemove(voter),
            downVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            "status": "success",
            "message": "Discussion netralvoted",
            data: {
                vote: {
                    discussionId: discussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};

export const discussionById = async (req, res) => {
    const discussionId = req.params.id;
    try {
        // Take discussion by id
        const discussionDoc = await getDoc(doc(db, 'discussions', discussionId));
        if (!discussionDoc.exists()) {
            return res.status(404).json({
                error: "Discussion not found"
            });
        }
        const data = discussionDoc.data();
        const createdAt = data.createdAt;

        // Format the createdAt field if it exists
        let formattedCreatedAt = '';
        if (createdAt && createdAt.seconds) {
            const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
            formattedCreatedAt = date.toISOString();
        }

        const discussionData = {
            id: discussionDoc.id,
            idUser: data.idUser,
            title: data.title,
            category: data.category,
            body: data.body,
            createdAt: formattedCreatedAt
        };

        // Take all comment on destination that has same idDiscussion
        const comments_on_discussion = [];
        const commentsRef = collection(db, "comment_on_discussion");
        const q = query(commentsRef, where("idDiscussion", "==", discussionId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt;
            const date = createdAt.toDate();
            data.createdAt = date.toISOString();
            // console.log("data => ", data);
            comments_on_discussion.push(data);
        });

        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                detailDiscussion: {
                    idDiscussion: discussionId,
                    ...discussionData,
                    comments: comments_on_discussion,
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

export const commentOnDiscussion = async (req, res) => {
    const { idDiscussion, comment } = req.body;
    if (!idDiscussion || !comment) {
        return res.status(400).json({ error: "idDiscussion and comment are required are required." });
    }
    const idUser = req.user.uid;
    try {
        const discussionRef = doc(db, "discussions", idDiscussion);
        const discussionDoc = await getDoc(discussionRef);

        if (!discussionDoc.exists()) {
            return res.status(404).json({ error: "Discussion not found." });
        }
        const addCommentOnDiscussion = await addDoc(collection(db, 'comment_on_discussion'), {
            idDiscussion: idDiscussion,
            idUser: idUser,
            comment: comment,
            createdAt: new Date()
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                comment: {
                    id: addCommentOnDiscussion.id,
                    idDiscussion,
                    idUser,
                    comment,
                    createdAt: new Date()
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

export const upVotesCommentOnDiscussion = async (req, res) => {
    const commentOnDiscussionId = req.params.id;

    if (!commentOnDiscussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Comment on discussion ID is required."
        });
    }

    const commentOnDiscussionRef = doc(db, "comment_on_discussion", commentOnDiscussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const commentOnDiscussionDoc = await getDoc(commentOnDiscussionRef);

        if (!commentOnDiscussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Comment on discussion not found."
            });
        }

        await updateDoc(commentOnDiscussionRef, {
            upVotesBy: arrayUnion(voter),
            downVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            "status": "success",
            "message": "Comment on discussion upvoted",
            data: {
                vote: {
                    discussionId: commentOnDiscussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};

export const downVotesCommentOnDiscussion = async (req, res) => {
    const commentOnDiscussionId = req.params.id;

    if (!commentOnDiscussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Comment on discussion ID is required."
        });
    }

    const commentOnDiscussionRef = doc(db, "comment_on_discussion", commentOnDiscussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const commentOnDiscussionDoc = await getDoc(commentOnDiscussionRef);

        if (!commentOnDiscussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Comment on discussion not found."
            });
        }

        await updateDoc(commentOnDiscussionRef, {
            downVotesBy: arrayUnion(voter),
            upVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            "status": "success",
            "message": "Comment on discussion downvoted",
            data: {
                vote: {
                    discussionId: commentOnDiscussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};

export const netralVotesCommentOnDiscussion = async (req, res) => {
    const commentOnDiscussionId = req.params.id;

    if (!commentOnDiscussionId) {
        return res.status(400).json({
            status: "fail",
            message: "Discussion ID is required."
        });
    }

    const commentOnDiscussionRef = doc(db, "comment_on_discussion", commentOnDiscussionId);
    const voter = {
        id: req.user.uid,
        name: req.user.name
    }

    try {
        const commentOnDiscussionDoc = await getDoc(commentOnDiscussionRef);

        if (!commentOnDiscussionDoc.exists()) {
            return res.status(404).json({
                status: "fail",
                message: "Discussion not found."
            });
        }

        await updateDoc(commentOnDiscussionRef, {
            upVotesBy: arrayRemove(voter),
            downVotesBy: arrayRemove(voter)
        });

        res.status(200).json({
            "status": "success",
            "message": "Comment on discussion netralvoted",
            data: {
                vote: {
                    discussionId: commentOnDiscussionId,
                    userId: req.user.uid,
                    name: req.user.name
                }
            }
        });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error.",
            error: error.message
        });
    }
};