import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

import { auth } from './firebaseConfig'

export const signUp = async (
    email: string,
    password: string,
    name: string
) => {
    const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
    );
    await updateProfile(res.user, {
        displayName: name,
    })

    return res.user;
}



// LOGIN 
export const login = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    return res.user;
}


// LOGOUT
export const logout = async () => {
    await signOut(auth);
}