import { initializeApp } from 'firebase/app';
import { getFirestore, doc, addDoc, deleteDoc, updateDoc, collection, getDocs, getDoc, query, where, writeBatch } from 'firebase/firestore/lite';

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

export const addDestination = async (req, res) => {
    const { name, photo, location, description, idCampaign } = req.body;
    if (!name || !photo || !location || !description) {
        return res.status(400).json({ error: "name, photo, location and description are required." });
    }
    const campaignId = idCampaign !== undefined ? idCampaign : null;
    try {
        const addDestination = await addDoc(collection(db, "destinations"), {
            name: name,
            photo: photo,
            location: location,
            description: description,
            idCampaign: campaignId
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                destination: {
                    id: addDestination.id,
                    name,
                    photo,
                    location,
                    description,
                    idCampaign: campaignId
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

export const deleteDestination = async (req, res) => {
    const destinationId = req.params.id;

    if (!destinationId) {
        return res.status(400).json({ error: "destinationId is required." });
    }

    try {
        const destinationRef = doc(db, 'destinations', destinationId);
        const destinationDoc = await getDoc(destinationRef);
        if (!destinationDoc.exists()) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const commentsRef = collection(db, "comment_on_destination");
        const q = query(commentsRef, where("idDestination", "==", destinationId));
        const querySnapshot = await getDocs(q);

        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);  // Add comment deletions to batch
        });

        batch.delete(destinationRef);  // Add destination deletion to batch

        // Commit batch
        await batch.commit();

        return res.status(200).json({
            status: "success",
            message: "Destination and its comments deleted successfully",
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

export const updateDestination = async (req, res) => {
    const destinationId = req.params.id;
    const { name, photo, location, description, idCampaign } = req.body;
    if (!name || !photo || !location || !description) {
        return res.status(400).json({ error: "name, photo, location and description are required." });
    }
    try {
        const destinationRef = doc(db, "destinations", destinationId);
        await updateDoc(destinationRef, {
            name, 
            photo, 
            location, 
            description, 
            idCampaign 
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                destination: {
                    id: destinationId,
                    name,
                    photo,
                    location,
                    description,
                    idCampaign
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

export const allDestination = async (req, res) => {
    try {
        const destinations = collection(db, 'destinations');
        const destinationSnapshot = await getDocs(destinations);
        const destinationList = destinationSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const promises = [];
        for (const destination of destinationList) {
            if (destination.idCampaign) {
                // console.log(`Document with ID ${destination.id} has idCampaign: ${destination.idCampaign}`);
                const campaignDocSnapshot = await getDoc(doc(db, 'campaigns', destination.idCampaign));
                if (campaignDocSnapshot.exists()) {
                    const campaignData = campaignDocSnapshot.data();
                    const concate = {
                        ...destination,
                        campaign: campaignData
                    };
                    promises.push(concate);
                } else {
                    console.log("Document does not exist");
                }
            } else {
                const onlyDestination = {
                    ...destination
                }
                promises.push(onlyDestination);
            }
        }

        const resList = await Promise.all(promises);

        return res.status(200).json({
            status: "success",
            message: "ok",
            data: resList
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

export const destinationById = async (req, res) => {
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
            // console.log(doc.id);
            const obj = {
                id: doc.id,
                idDestination: data.idDestination,
                comment: data.comment,
                createdAt: data.createdAt,
                owner: {
                    idUser: data.idUser,
                    name: data.name,
                    photo: data.photo,
                }
            }
            comments_on_destination.push(obj);
        });

        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                detailDestination: {
                    idDestination: destinationId,
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
};

export const commentOnDestination = async (req, res) => {
    // const { idDestination, comment } = req.body;
    const { comment } = req.body;
    // const name = req.user.name;
    const idDestination = req.params.id;
    const idUser = req.user.uid;

    if (!idDestination || !comment) {
        return res.status(400).json({ error: "idDestination and comment are required" });
    }

    try {
        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }
        const userData = userDoc.data();
        const name = userData.displayName;
        const photoURL = userData.photoURL;
        const addCommentOnDestination = await addDoc(collection(db, 'comment_on_destination'), {
            idDestination: idDestination,
            idUser: idUser,
            name: name,
            comment: comment,
            photo: photoURL,
            createdAt: new Date()
        });
        return res.status(200).json({
            status: "success",
            message: "ok",
            data: {
                comment: {
                    id: addCommentOnDestination.id,
                    idDestination,
                    comment,
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

export const updateCommentOnDestination = async (req, res) => {
    const userId = req.user.uid;
    const destinationId = req.params.id;
    const commentId = req.params.commentId;

    const { comment } = req.body;

    if (!userId || !destinationId || !commentId || !comment) {
        return res.status(400).json({ error: "commentId, userId, and description are required." });
    };

    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        const commentRef = doc(db, 'comment_on_destination', commentId);
        const commentDoc = await getDoc(commentRef);

        if( !userDoc.exists() || !commentDoc.exists()) {
            return res.status(404).json({ error: "User or comment not found." });
        }

        await updateDoc(commentRef, {
            comment: comment,
            createdAt: new Date()
        });

        return res.status(200).json({
            status: "success",
            message: "Comment updated successfully",
            data: {
                comment: {
                    id: commentId,
                    idDestination: destinationId,
                    comment: comment,
                    createdAt: new Date(),
                    owner: {
                        idUser: userId,
                        name: userDoc.data().displayName,
                        photo: userDoc.data().photoURL
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

export const deleteCommentOnDestination = async (req, res) => {
    const idCommentOnDestination = req.params.commentId;
    const idUser = req.user.uid;

    if (!idCommentOnDestination) {
        return res.status(400).json({ error: "idCommentOnDestination is required." });
    }
    
    try {
        const userRef = doc(db, 'users', idUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found." });
        }

        const commentRef = doc(db, 'comment_on_destination', idCommentOnDestination);
        const commentDoc = await getDoc(commentRef);
        if (!commentDoc.exists()) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const commentData = commentDoc.data();
        const ownerId = commentData.idUser;

        if (idUser !== ownerId) {
            return res.status(403).json({ error: "This comment not belong to you, dont try malicious stuff." });
        }

        await deleteDoc(doc(db, "comment_on_destination", idCommentOnDestination));
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