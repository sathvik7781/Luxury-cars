import { useEffect, useState } from "react";
import { addCar, getCars, updateCar, deleteCar } from "../services/carService";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const PAGE_SIZE = 10;

const Admin = () => {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    year: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [sortPrice, setSortPrice] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const loadCars = async () => {
    const data = await getCars();
    setCars(data);
  };

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.price || !form.year) return;

    try {
      setSaving(true);
      let uploadedUrls = [];

      if (images.length > 0) {
        setUploadingImages(true);
        uploadedUrls = await Promise.all(
          images.map((file) => uploadToCloudinary(file))
        );
        setUploadingImages(false);
      }

      const existingCar = editingId
        ? cars.find((c) => c.id === editingId)
        : null;

      const coverImage =
        uploadedUrls.length > 0
          ? uploadedUrls[coverIndex]
          : existingCar?.coverImage || "";

      const payload = {
        ...form,
        price: Number(form.price),
        year: Number(form.year),
        coverImage,
        images:
          uploadedUrls.length > 0 ? uploadedUrls : existingCar?.images || [],
      };

      if (editingId) {
        await updateCar(editingId, payload);
        setEditingId(null);
      } else {
        await addCar({
          ...payload,
          available: true,
          createdAt: new Date(),
        });
      }

      setForm({ brand: "", model: "", price: "", year: "" });
      setImages([]);
      setPreviewImages([]);
      setCoverIndex(0);
      await loadCars();
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const handleEdit = (car) => {
    setForm({
      brand: car.brand,
      model: car.model,
      price: car.price,
      year: car.year,
    });
    setImages([]);
    setPreviewImages(car.images || []);
    setCoverIndex(car.images?.findIndex((img) => img === car.coverImage) || 0);
    setEditingId(car.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this car?")) return;
    await deleteCar(id);
    loadCars();
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

  /* ---------- FILTER + SORT + PAGINATION ---------- */
  const filtered = cars
    .filter((c) => {
      const t = search.toLowerCase();
      return (
        c.brand.toLowerCase().includes(t) ||
        c.model.toLowerCase().includes(t) ||
        String(c.price).includes(t) ||
        String(c.year).includes(t)
      );
    })
    .sort((a, b) => {
      if (!sortPrice) return 0;
      return sortPrice === "asc" ? a.price - b.price : b.price - a.price;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, sortPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ---------- DASHBOARD HEADER ---------- */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Admin <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage inventory, pricing, and availability
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 w-fit">
          <i className="fa-solid fa-car text-indigo-600 text-sm"></i>
          <span className="text-sm font-semibold text-indigo-700">
            {cars.length} Cars
          </span>
        </div>
      </div>

      {/* ---------- FORM CARD ---------- */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-indigo-50 p-5 sm:p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            {editingId ? "Update Car" : "Add New Car"}
          </h2>

          {editingId && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Editing Mode
            </span>
          )}
        </div>

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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
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
                setPreviewImages(
                  files.map((file) => URL.createObjectURL(file))
                );
                setCoverIndex(0); // default first image as cover
              }}
              className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-lg file:border-0
      file:text-sm file:font-semibold
      file:bg-indigo-50 file:text-indigo-700
      hover:file:bg-indigo-100"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              disabled={saving || uploadingImages}
              className="
                rounded-xl px-5 py-2 text-sm font-semibold
                bg-emerald-600 text-white
                hover:bg-emerald-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
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
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select cover image
              </p>

              <div className="flex gap-3 overflow-x-auto">
                {previewImages.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverIndex(idx)}
                    className={`relative rounded-xl border-2 transition
            ${
              coverIndex === idx
                ? "border-indigo-600"
                : "border-transparent hover:border-gray-300"
            }
          `}
                  >
                    {/* REMOVE BUTTON */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute -top-2 -right-2 z-10
      flex h-5 w-5 items-center justify-center
      rounded-full bg-rose-600 text-xs font-bold text-white
      hover:bg-rose-700 cursor-pointer"
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
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="relative mb-5 max-w-md">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          className="
            w-full rounded-xl border border-gray-300
            bg-gray-50 pl-9 pr-4 py-2 text-sm
            focus:bg-white focus:border-indigo-500
            focus:ring-2 focus:ring-indigo-500/30
            outline-none transition
          "
          placeholder="Search cars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700">
              <th className="px-4 py-3 text-left font-semibold">Brand</th>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th
                onClick={() =>
                  setSortPrice((p) =>
                    p === "asc" ? "desc" : p === "desc" ? null : "asc"
                  )
                }
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
              >
                Price{" "}
                {sortPrice === "asc" && (
                  <i className="fa-solid fa-arrow-up text-xs ml-1"></i>
                )}
                {sortPrice === "desc" && (
                  <i className="fa-solid fa-arrow-down text-xs ml-1"></i>
                )}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Year</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <i className="fa-solid fa-car text-4xl"></i>
                    <p className="text-sm font-medium">No cars found</p>
                    <p className="text-xs">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {paginated.map((car, idx) => (
              <tr
                key={car.id}
                className={`
                  cursor-pointer transition
                  ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  hover:bg-indigo-50/60
                `}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {car.brand}
                </td>
                <td className="px-4 py-3 text-gray-700">{car.model}</td>
                <td className="px-4 py-3 font-semibold text-emerald-700">
                  ₹{car.price}
                </td>
                <td className="px-4 py-3 text-gray-600">{car.year}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(car)}
                      className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            <i className="fa-solid fa-chevron-left text-xs mr-1"></i>
            Prev
          </button>

          <span className="rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white">
            {page}
          </span>

          <span className="text-sm text-gray-500">of {totalPages}</span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Next
            <i className="fa-solid fa-chevron-right text-xs ml-1"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;
