import TshirtEditor from '@/components/TshirtEditor';

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-black pt-20"> {/* Add padding for top */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-white mb-2">STUDIO</h1>
        <p className="text-gray-400">Drag, Drop, Create.</p>
      </div>
      
      <TshirtEditor />
    </div>
  );
}