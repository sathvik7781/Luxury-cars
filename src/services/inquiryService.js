import {
  collection,
  getDocs,
  doc,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { INQUIRY_STATUS } from "../constants/status";

/* ---------- STATUS STATE MACHINE ---------- */
const ALLOWED_TRANSITIONS = {
  pending: [INQUIRY_STATUS.CONTACTED],
  contacted: [INQUIRY_STATUS.SOLD, INQUIRY_STATUS.NOT_SOLD],
  sold: [],
  not_sold: [],
};

const inquiriesCol = collection(db, "inquiries");

export const getInquiries = async (user) => {
  const q = user.isAdmin
    ? inquiriesCol
    : query(inquiriesCol, where("userEmail", "==", user.email));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateInquiryStatus = async (inquiry, newStatus) => {
  const inquiryRef = doc(db, "inquiries", inquiry.id);
  const carRef = doc(db, "cars", inquiry.carId);

  await runTransaction(db, async (transaction) => {
    const inquirySnap = await transaction.get(inquiryRef);

    if (!inquirySnap.exists()) {
      throw new Error("Inquiry not found");
    }

    const data = inquirySnap.data();
    const prevStatus = data.status;
    const history = data.statusHistory || [];

    // 🚫 Enforce lifecycle
    if (!ALLOWED_TRANSITIONS[prevStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${prevStatus} → ${newStatus}`
      );
    }

    /* ---------- NON-SOLD FLOW ---------- */
    if (newStatus !== INQUIRY_STATUS.SOLD) {
      transaction.update(inquiryRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: [
          ...history,
          {
            from: prevStatus,
            to: newStatus,
            changedBy: "admin@gmail.com",
            changedAt: new Date(), // ✅ correct
          },
        ],
      });
      return;
    }

    /* ---------- SOLD FLOW ---------- */
    const carSnap = await transaction.get(carRef);

    if (!carSnap.exists()) {
      throw new Error("Car not found");
    }

    if (carSnap.data().available === false) {
      throw new Error("This car is already sold");
    }

    // 1️⃣ Mark car as sold
    transaction.update(carRef, { available: false });

    // 2️⃣ Mark selected inquiry as SOLD
    transaction.update(inquiryRef, {
      status: INQUIRY_STATUS.SOLD,
      carAvailable: false,
      updatedAt: serverTimestamp(),
      statusHistory: [
        ...history,
        {
          from: prevStatus,
          to: INQUIRY_STATUS.SOLD,
          changedBy: "admin@gmail.com",
          changedAt: new Date(), // ✅ correct
        },
      ],
    });

    // 3️⃣ Close all other inquiries
    const q = query(inquiriesCol, where("carId", "==", inquiry.carId));
    const snap = await getDocs(q);

    snap.docs.forEach((d) => {
      if (d.id !== inquiry.id) {
        transaction.update(doc(db, "inquiries", d.id), {
          status: INQUIRY_STATUS.NOT_SOLD,
          carAvailable: false,
          updatedAt: serverTimestamp(),
        });
      }
    });
  });
};
