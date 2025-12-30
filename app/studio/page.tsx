import TshirtEditor from '@/components/TshirtEditor';
import Navbar from '@/components/Navigation';

export default function StudioPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-32 pb-16">
        <div className="text-center mb-10 px-4">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">Design Studio</h1>
          <p className="text-gray-400 text-lg">Create your unique masterpiece. Drag, drop, and unleash your creativity.</p>
        </div>

        <TshirtEditor />
      </div>
    </>
  );
}