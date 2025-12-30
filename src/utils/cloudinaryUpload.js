export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Luxury_cars");
  formData.append("folder", "car-dealership/cars");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/doqfrygfc/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};
