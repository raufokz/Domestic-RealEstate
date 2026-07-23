export default function Loading() {
  return (
    <div className="bg-white min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-[#C9A227] border-t-transparent animate-spin" />
        </div>
        <p className="font-heading text-[#0A2647] text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
