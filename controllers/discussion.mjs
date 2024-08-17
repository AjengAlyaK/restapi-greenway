import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc, addDoc, deleteDoc, collection, getDocs, getDoc, query, where, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore/lite';
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
        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }
        const userData = userDoc.data();
        const name = userData.displayName;
        const photoURL = userData.photoURL;
        const addDiscussion = await addDoc(collection(db, 'discussions'), {
            idUser: idUser,
            name: name,
            photo: photoURL,
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
                    name: name,
                    photo: photoURL,
                    title,
                    category,
                    body,
                    upVotesBy,
                    downVotesBy,
                    comments: 0,
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

export const  deleteDiscussion = async (req, res) => {
    const discussionId = req.params.id;
    const idUser = req.user.uid;

    if (!discussionId) {
        return res.status(400).json({ error: "discussionId is required." });
    }

    try {
        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }

        const discussionRef = doc(db, 'discussions', discussionId);
        const discussionDoc = await getDoc(discussionRef);
        if (!discussionDoc.exists()) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const discussionData = discussionDoc.data();
        const ownerId = discussionData.idUser;

        if (idUser !== ownerId) {
            return res.status(403).json({ error: "This discussion not belong to you, dont try malicious stuff." });
        }

        // Query comments associated with the discussion
        const commentsRef = collection(db, "comment_on_discussion");
        const q = query(commentsRef, where("discussionId", "==", discussionId));
        const querySnapshot = await getDocs(q);

        // Initialize batch
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);  // Add comment deletions to batch
        });

        batch.delete(discussionRef);  // Add discussion deletion to batch

        // Commit batch
        await batch.commit();

        // await deleteDoc(doc(db, "discussions", discussionId));
        return res.status(200).json({
            status: "success",
            message: "Discussion and its comments deleted successfully",
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

export const allDiscussion = async (req, res) => {
    try {
        const discussions = collection(db, 'discussions');
        const discussionSnapshot = await getDocs(discussions);
        const discussionList = await Promise.all(discussionSnapshot.docs.map(async (doc) => {
            const discussionData = doc.data();
            // console.log(discussionData);
            const createdAt = discussionData.createdAt;
            let formattedCreatedAt = '';

            if (createdAt && createdAt.seconds) {
                // Firestore Timestamp to JavaScript Date object
                const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
                // Format the date to ISO 8601 string
                formattedCreatedAt = date.toISOString();
            }

            // Take all comment on destination that has same idDiscussion
            const comments_on_discussion = [];
            const commentsRef = collection(db, "comment_on_discussion");
            const q = query(commentsRef, where("discussionId", "==", doc.id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((commentDoc) => {
                const commentData = commentDoc.data();
                const createdAt = commentData.createdAt;
                const date = createdAt.toDate();
                commentData.createdAt = date.toISOString();
                comments_on_discussion.push(commentData);
            });

            const upVotesByIds = discussionData.upVotesBy.map(voter => voter.id);
            const downVotesByIds = discussionData.downVotesBy.map(voter => voter.id);
            // console.log(upVotesByIds);

            return {
                id: doc.id,
                idUser: discussionData.idUser,
                name: discussionData.name,
                photo: discussionData.photo,
                title: discussionData.title,
                category: discussionData.category,
                body: discussionData.body,
                // upVotesBy: discussionData.upVotesBy,
                upVotesBy: upVotesByIds,
                downVotesBy: downVotesByIds,
                createdAt: formattedCreatedAt,
                comments: comments_on_discussion.length
            };
        }));
        // Sort discussionList by createdAt in descending order (newest first)
        discussionList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                discussions: discussionList
            }
        });
    } catch (error) {
        const errorCode = error.code || 500;
        const errorMessage = error.message || "Internal Server Error";
        return res.status(errorCode).json({
            error: {
                code: errorCode,
                message: errorMessage
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
        // id: userId,
        // name: name
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
        const idUser = data.idUser;
        const createdAt = data.createdAt;
        const upVotesByIds = data.upVotesBy.map(voter => voter.id);
        const downVotesByIds = data.downVotesBy.map(voter => voter.id);

        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }
        const userData = userDoc.data();
        const name = userData.displayName;
        const photoURL = userData.photoURL;

        // Format the createdAt field if it exists
        let formattedCreatedAt = '';
        if (createdAt && createdAt.seconds) {
            const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
            formattedCreatedAt = date.toISOString();
        }

        const discussionData = {
            id: discussionDoc.id,
            title: data.title,
            category: data.category,
            body: data.body,
            upVotesBy: upVotesByIds,
            downVotesBy: downVotesByIds,
            createdAt: formattedCreatedAt,
            owner: {
                idUser: data.idUser,
                name: name,
                photo: photoURL,
            }
        };

        // Take all comment on discussion that has same idDiscussion
        const comments_on_discussion = [];
        const commentsRef = collection(db, "comment_on_discussion");
        const q = query(commentsRef, where("discussionId", "==", discussionId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // console.log(data);
            const createdAt = data.createdAt;
            const date = createdAt.toDate();
            data.createdAt = date.toISOString();
            data.id = doc.id;
            data.upVotesBy = data.upVotesBy.map(voter => voter.id);
            data.downVotesBy = data.downVotesBy.map(voter => voter.id);
            const obj = {
                id: data.id,
                discussionId: data.discussionId,
                comment: data.comment,
                upVotesBy: data.upVotesBy,
                downVotesBy: data.downVotesBy,
                createdAt: data.createdAt,
                owner: {
                    idUser: data.idUser,
                    name: data.name,
                    photo: data.photo
                }
            }
            // comments_on_discussion.push(data);
            comments_on_discussion.push(obj);
        });

        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                detailDiscussion: {
                    discussionId: discussionId,
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
    // const { idDiscussion, comment } = req.body;
    const { comment } = req.body;
    // const name = req.user.name;
    if (!comment) {
        return res.status(400).json({ error: "discussionId and comment are required are required." });
    }
    const idUser = req.user.uid;
    const discussionId = req.params.id;
    const userRef = doc(db, 'users', idUser);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        return res.status(404).json({ error: "User not found." });
    }
    const userData = userDoc.data();
    const name = userData.displayName;
    const photoURL = userData.photoURL;
    const upVotesBy = [];
    const downVotesBy = [];
    try {
        const discussionRef = doc(db, "discussions", discussionId);
        const discussionDoc = await getDoc(discussionRef);

        if (!discussionDoc.exists()) {
            return res.status(404).json({ error: "Discussion not found." });
        }
        const addCommentOnDiscussion = await addDoc(collection(db, 'comment_on_discussion'), {
            discussionId: discussionId,
            idUser: idUser,
            name: name,
            photo: photoURL,
            comment: comment,
            upVotesBy: upVotesBy,
            downVotesBy: downVotesBy,
            createdAt: new Date()
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                comment: {
                    id: addCommentOnDiscussion.id,
                    discussionId,
                    comment,
                    upVotesBy: upVotesBy,
                    downVotesBy: downVotesBy,
                    createdAt: new Date(),
                    owner: {
                        idUser,
                        name: name,
                        photo: photoURL,
                    }
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

export const deleteCommentOnDiscussion = async (req, res) => {
    const idCommentOnDiscussion = req.params.commentId;
    const idUser = req.user.uid;

    if (!idCommentOnDiscussion) {
        return res.status(400).json({ error: "idCommentOnDiscussion is required." });
    }

    try {
        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }

        const commentRef = doc(db, 'comment_on_discussion', idCommentOnDiscussion);
        const commentDoc = await getDoc(commentRef);
        if (!commentDoc.exists()) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const commentData = commentDoc.data();
        const ownerId = commentData.idUser;

        if (idUser !== ownerId) {
            return res.status(403).json({ error: "This comment not belong to you, dont try malicious stuff." });
        }

        await deleteDoc(doc(db, "comment_on_discussion", idCommentOnDiscussion));
        return res.status(200).json({
            status: "success",
            message: "Comment deleted successfully",
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