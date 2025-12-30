'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; 
import { supabase } from '../app/utils/supabase'; 
import { useRouter } from 'next/navigation'; // Import Router for redirection

export default function TshirtEditor() {
  const router = useRouter(); // Initialize Router
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [tshirtImage, setTshirtImage] = useState<fabric.FabricImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff0000'); 

  // --- INITIALIZE CANVAS RESPONSIVELY ---
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const canvasSize = Math.min(containerWidth, 500); 

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        height: canvasSize, 
        width: canvasSize,
        backgroundColor: '#ffffff',
        selection: true,
      });

      // --- LOAD T-SHIRT ---
      fabric.FabricImage.fromURL('/tshirt-transparent.png.png', { crossOrigin: 'anonymous' })
        .then((img) => {
          const imgScale = (canvasSize * 0.8) / (img.width || 500); 
          
          img.set({
              scaleX: imgScale,
              scaleY: imgScale,
              selectable: false, 
              evented: false,   
          });

          // Apply Red Filter Default
          const filter = new fabric.filters.BlendColor({
             color: '#ff0000',
             mode: 'multiply', 
             alpha: 1
          });
          img.filters = [filter];
          img.applyFilters();

          initCanvas.add(img);
          
          // Center and Send to Back
          initCanvas.centerObject(img); 
          initCanvas.moveObjectTo(img, 0); 

          setTshirtImage(img);
          initCanvas.renderAll();
        })
        .catch(err => console.error("Error loading T-shirt:", err));

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  // --- TOOLS ---
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);

    if (tshirtImage && canvas) {
      const filter = new fabric.filters.BlendColor({
        color: color,
        mode: 'multiply',
        alpha: 1
      });

      tshirtImage.filters = [filter];
      tshirtImage.applyFilters();
      canvas.requestRenderAll();
    }
  };

  const addText = () => {
    if (canvas) {
      const text = new fabric.Textbox('SARIONYX', {
        fontFamily: 'Arial',
        fill: '#333333',
        fontSize: canvas.width ? canvas.width * 0.08 : 30,
        fontWeight: 'bold',
      });
      canvas.add(text);
      canvas.centerObject(text);
      canvas.setActiveObject(text);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        fabric.FabricImage.fromURL(data).then((img) => {
          const logoScale = (canvas.width! * 0.3) / (img.width || 100);
          img.scale(logoScale);
          canvas.add(img);
          canvas.centerObject(img);
          canvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelected = () => {
    if (canvas) {
        const activeObj = canvas.getActiveObject();
        if(activeObj) canvas.remove(activeObj);
    }
  }

  // --- CORE LOGIC: ADD TO CART ---
  const addToCart = async () => {
      if (!canvas) return;
      setIsSaving(true);

      try {
        // 1. Upload Image to Storage
        const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
        const res = await fetch(dataURL);
        const blob = await res.blob();
        const fileName = `design-${Date.now()}.png`;
        
        const { error: uploadError } = await supabase.storage
            .from('designs')
            .upload(fileName, blob, { contentType: 'image/png' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('designs')
            .getPublicUrl(fileName);

        // 2. Insert into Database Table (saved_designs)
        const { data, error: dbError } = await supabase
            .from('saved_designs')
            .insert([
                { 
                    product_id: 1, // Placeholder ID for "Basic Tee"
                    preview_url: publicUrl,
                    design_data: canvas.toJSON() // Saves editable version
                }
            ])
            .select() // Return the new row
            .single();

        if (dbError) throw dbError;

        // 3. Redirect to Cart Page
        console.log("Saved to DB:", data);
        router.push(`/cart?id=${data.id}`); 

      } catch (error: any) {
        console.error('Error:', error);
        alert(`Failed: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 bg-white border rounded-xl shadow-sm max-w-7xl mx-auto w-full">
      
      {/* TOOLS SECTION */}
      <div className="flex flex-col gap-4 w-full lg:w-1/4 order-2 lg:order-1">
        <h3 className="font-bold text-lg border-b pb-2">Designer Tools</h3>
        
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">T-Shirt Color</label>
            <div className="flex items-center gap-2">
                <input 
                    type="color" 
                    value={selectedColor} 
                    onChange={handleColorChange} 
                    className="h-12 w-full cursor-pointer border rounded-md"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <button onClick={addText} className="bg-gray-900 text-white py-3 rounded hover:bg-gray-700 transition font-medium text-sm">
                + Add Text
            </button>
            <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
                <label htmlFor="img-upload" className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 text-gray-600 rounded cursor-pointer hover:border-blue-500 hover:text-blue-500 transition font-medium text-sm">
                    Upload Logo
                </label>
            </div>
        </div>

        <button onClick={deleteSelected} className="bg-red-50 text-red-600 border border-red-200 py-3 rounded hover:bg-red-100 transition text-sm font-medium">
            Remove Selected
        </button>

        <div className="mt-4 lg:mt-auto pt-4 border-t">
            {/* UPDATED BUTTON */}
            <button 
                onClick={addToCart} 
                disabled={isSaving} 
                className="w-full bg-blue-600 text-white py-4 rounded shadow-md hover:bg-blue-700 transition font-bold text-lg disabled:opacity-50"
            >
                {isSaving ? 'Processing...' : 'Add to Cart ->'}
            </button>
        </div>
      </div>

      {/* CANVAS SECTION */}
      <div className="flex-1 flex justify-center items-center bg-gray-50 rounded-lg p-4 lg:p-8 order-1 lg:order-2 overflow-hidden">
        <div ref={containerRef} className="shadow-2xl border-4 border-white bg-white w-full max-w-[500px] aspect-square flex justify-center items-center">
             <canvas ref={canvasRef} />
        </div>
      </div>

    </div>
  );
}