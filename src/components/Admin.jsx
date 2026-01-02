import { useEffect, useState, useMemo, useCallback } from "react";
import { addCar, getCars, updateCar, deleteCar } from "../services/carService";
import Swal from "sweetalert2";
import AddEditCarForm from "./AddEditCarForm";
import AdminTable from "./AdminTable";
import Pagination from "./Pagination";
import EditModal from "./EditModal";

const PAGE_SIZE = 10;

const Admin = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const loadCars = useCallback(async () => {
    setLoading(true);
    const data = await getCars();
    setCars(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleFormSubmit = useCallback(
    async (uploadedUrls) => {
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

      await loadCars();
    },
    [form, editingId, coverIndex, cars, loadCars]
  );

  const handleEdit = useCallback((car) => {
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
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const confirm = await Swal.fire({
        title: "Delete this car?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#374151",
        confirmButtonText: "Yes, delete",
      });

      if (!confirm.isConfirmed) return;

      await deleteCar(id);
      await loadCars();

      Swal.fire({
        icon: "success",
        title: "Car deleted",
        timer: 1200,
        showConfirmButton: false,
      });
    },
    [loadCars]
  );

  /* ---------- FILTER + SORT + PAGINATION ---------- */
  const filtered = useMemo(() => {
    return cars
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
  }, [cars, search, sortPrice]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [search, sortPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-[#0b0b0e] text-white">
      {/* ---------- DASHBOARD HEADER ---------- */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Admin <span className="text-[#c9a24d]">Dashboard</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Manage inventory, pricing, and availability
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#121217] border border-white/10 px-4 py-2 w-fit">
          <i className="fa-solid fa-car text-indigo-600 text-sm"></i>
          <span className="text-sm font-semibold text-white">
            {cars.length} Cars
          </span>
        </div>
      </div>

      {/* ---------- FORM CARD ---------- */}
      {!editingId && (
        <div className="rounded-2xl border border-white/10 bg-[#121217] p-5 sm:p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white/80">
              {editingId ? "Update Car" : "Add New Car"}
            </h2>

            {editingId && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Editing Mode
              </span>
            )}
          </div>

          <AddEditCarForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            setEditingId={setEditingId}
            images={images}
            setImages={setImages}
            previewImages={previewImages}
            setPreviewImages={setPreviewImages}
            coverIndex={coverIndex}
            setCoverIndex={setCoverIndex}
            saving={saving}
            setSaving={setSaving}
            uploadingImages={uploadingImages}
            setUploadingImages={setUploadingImages}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}
      {/* ---------- SEARCH ---------- */}
      <div className="relative mb-5 max-w-md">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
        <input
          className="
            w-full rounded-xl bg-[#1a1a22] border border-white/10 pl-9 pr-4 py-2 text-sm
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
      <AdminTable
        loading={loading}
        paginated={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortPrice={sortPrice}
        setSortPrice={setSortPrice}
      />

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      )}
      <EditModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        form={form}
        setForm={setForm}
        editingId={editingId}
        setEditingId={setEditingId}
        images={images}
        setImages={setImages}
        previewImages={previewImages}
        setPreviewImages={setPreviewImages}
        coverIndex={coverIndex}
        setCoverIndex={setCoverIndex}
        saving={saving}
        setSaving={setSaving}
        uploadingImages={uploadingImages}
        setUploadingImages={setUploadingImages}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Admin;
