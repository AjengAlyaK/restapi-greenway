import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, setDoc, doc, addDoc, collection, getDocs, getDoc, query, where } from 'firebase/firestore/lite';
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
        return res.status(400).json({ error: "idDestination and comment are required are required." });
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