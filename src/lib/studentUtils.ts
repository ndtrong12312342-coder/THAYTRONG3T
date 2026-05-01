import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

export const getStudentsSummary = async () => {
    try {
        const summarySnap = await getDoc(doc(db, 'metadata', 'students'));
        if (summarySnap.exists() && summarySnap.data().students) {
            return summarySnap.data().students;
        }
    } catch (e) {
        console.error("Error reading students summary", e);
    }
    
    // Fallback
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    try {
        await setDoc(doc(db, 'metadata', 'students'), { students: list });
    } catch (e) {
        console.error("Error writing students summary", e);
    }
    return list;
};

export const syncStudentsSummary = async () => {
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(qStudents);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    try {
        await setDoc(doc(db, 'metadata', 'students'), { students: list });
    } catch (e) {
        console.error("Error writing students summary", e);
    }
    return list;
};
