import AddEditCarForm from "./AddEditCarForm";

const EditModal = ({
  showEditModal,
  setShowEditModal,
  form,
  setForm,
  editingId,
  setEditingId,
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
}) => {
  if (!showEditModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      onClick={() => {
        setShowEditModal(false);
        setEditingId(null);
        setImages([]);
        setPreviewImages([]);
        setCoverIndex(0);
        setForm({ brand: "", model: "", price: "", year: "" });
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-2xl bg-[#121217] border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Car Details</h2>
          <button
            onClick={() => {
              setShowEditModal(false);
              setEditingId(null);
              setImages([]);
              setPreviewImages([]);
              setCoverIndex(0);
              setForm({ brand: "", model: "", price: "", year: "" });
            }}
            className="text-white/50 hover:text-white text-xl"
          >
            ×
          </button>
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
          onSubmit={async (uploadedUrls) => {
            await onSubmit(uploadedUrls);
            setShowEditModal(false);
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </div>
    </div>
  );
};

export default EditModal;
