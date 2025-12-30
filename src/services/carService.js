import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const carRef = collection(db, "cars");

export const getCars = async () => {
  const snap = await getDocs(carRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addCar = (data) => addDoc(carRef, data);
export const updateCar = (id, data) => updateDoc(doc(db, "cars", id), data);
export const deleteCar = (id) => deleteDoc(doc(db, "cars", id));
