import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import Swal from "sweetalert2";

const AddEditCarForm = ({
  form,
  setForm,
  editingId,
  images,
  setImages,
  previewImages,
  setPreviewImages,
  coverIndex,
  setCoverIndex,
  saving,
  setSaving,
  uploadingImages,
  setUploadingImages,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.price || !form.year) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill all car details before saving.",
        confirmButtonColor: "#c9a24d",
      });
      return;
    }

    try {
      setSaving(true);
      Swal.fire({
        title: editingId ? "Updating car..." : "Adding car...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      let uploadedUrls = [];

      if (images.length > 0) {
        setUploadingImages(true);
        uploadedUrls = await Promise.all(
          images.map((file) => uploadToCloudinary(file))
        );
        setUploadingImages(false);
      }

      await onSubmit(uploadedUrls);
      setForm({ brand: "", model: "", price: "", year: "" });
      setImages([]);
      setPreviewImages([]);
      setCoverIndex(0);
      Swal.fire({
        icon: "success",
        title: editingId ? "Car updated" : "Car added",
        timer: 1400,
        showConfirmButton: false,
      });
      if (onCancel) onCancel();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: err.message || "Something went wrong",
      });
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const removeImage = (idx) => {
    const newPreviews = previewImages.filter((_, i) => i !== idx);
    const newImages = images.filter((_, i) => i !== idx);

    setPreviewImages(newPreviews);
    setImages(newImages);

    if (coverIndex === idx) {
      setCoverIndex(0);
    } else if (coverIndex > idx) {
      setCoverIndex((i) => i - 1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {["Brand", "Model", "Price", "Year"].map((field) => (
        <input
          key={field}
          placeholder={field}
          value={form[field.toLowerCase()]}
          onChange={(e) =>
            setForm({ ...form, [field.toLowerCase()]: e.target.value })
          }
          className="w-full rounded-xl bg-[#1a1a22] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[#c9a24d] focus:ring-[#c9a24d]/30 outline-none"
        />
      ))}
      <div className="sm:col-span-2 lg:col-span-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setImages(files);
            setPreviewImages(files.map((file) => URL.createObjectURL(file)));
            setCoverIndex(0);
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
        <button
          disabled={saving || uploadingImages}
          className="rounded-xl px-5 py-2 text-sm font-semibold bg-[#c9a24d] text-black hover:bg-[#b8933f] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {uploadingImages
            ? "Uploading images..."
            : saving
            ? "Saving..."
            : editingId
            ? "Update Car"
            : "Add Car"}
        </button>
      </div>
      {previewImages.length > 0 && (
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="text-sm font-medium text-white/70 mb-2">
            Select cover image
          </p>

          <div className="flex gap-3 overflow-x-auto">
            {previewImages.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCoverIndex(idx)}
                className={`relative rounded-xl border-2 transition ${
                  coverIndex === idx
                    ? "border-indigo-600"
                    : "border-transparent hover:border-white/30"
                }`}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  ×
                </span>

                <img
                  src={src}
                  alt="preview"
                  className="h-20 w-28 object-cover rounded-lg"
                />

                {coverIndex === idx && (
                  <span className="absolute top-1 right-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    COVER
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default AddEditCarForm;
