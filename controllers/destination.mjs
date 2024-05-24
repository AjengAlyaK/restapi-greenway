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

export const addDestination = async (req, res) => {
    const { name, photo, location, description, idCampaign } = req.body;
    if (!name || !photo || !location || !description ) {
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
                console.log(`Document with ID ${destination.id} has idCampaign: ${destination.idCampaign}`);
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
            data: resList
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};