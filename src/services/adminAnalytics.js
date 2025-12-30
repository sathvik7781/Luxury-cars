import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { INQUIRY_STATUS } from "../constants/status";

const now = Date.now();

const ranges = {
  today: 1,
  week: 7,
  month: 30,
  all: null,
};

export const getAdminAnalytics = async (range = "all") => {
  const carsSnap = await getDocs(collection(db, "cars"));
  const inquiriesSnap = await getDocs(collection(db, "inquiries"));

  const cars = carsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  let inquiries = inquiriesSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // ---------- TIME FILTER ----------
  if (ranges[range]) {
    const cutoff = now - ranges[range] * 24 * 60 * 60 * 1000;

    inquiries = inquiries.filter((i) => i.createdAt?.toMillis?.() >= cutoff);
  }

  const totalCars = cars.length;
  const soldCars = cars.filter((c) => c.available === false).length;

  const totalInquiries = inquiries.length;

  const pending = inquiries.filter(
    (i) => i.status === INQUIRY_STATUS.PENDING
  ).length;

  const contacted = inquiries.filter(
    (i) => i.status === INQUIRY_STATUS.CONTACTED
  ).length;

  const sold = inquiries.filter((i) => i.status === INQUIRY_STATUS.SOLD).length;

  const conversionRate =
    totalInquiries === 0 ? 0 : Math.round((sold / totalInquiries) * 100);

  // ---------- BRAND & CAR MAP ----------
  const brandMap = {};
  const carMap = {};

  inquiries.forEach((i) => {
    const brand = i.carName.split(" ")[0];
    brandMap[brand] = (brandMap[brand] || 0) + 1;
    carMap[i.carName] = (carMap[i.carName] || 0) + 1;
  });

  const brandData = Object.entries(brandMap).map(([name, value]) => ({
    name,
    value,
  }));

  const topCars = Object.entries(carMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, value]) => ({ name, value }));

  return {
    totalCars,
    soldCars,
    totalInquiries,
    pending,
    contacted,
    sold,
    conversionRate,
    brandData,
    topCars,
  };
};
