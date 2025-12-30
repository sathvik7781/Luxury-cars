import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getUnreadInquiryCount = async () => {
  const q = query(collection(db, "inquiries"), where("adminRead", "==", false));

  const snap = await getDocs(q);
  return snap.size;
};
