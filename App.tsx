
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, Html } from '@react-three/drei';
import Controls from './components/Controls';
import MappedObject from './components/MappedObject';
import { AppState, ShapeType, ProjectionType, Axis } from './types';
import { Loader2, Play, Pause } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    shape: ShapeType.Cube,
    projection: ProjectionType.Planar,
    axis: Axis.Z,
    autoRotate: true,
    blenderMode: false,
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    tiling: 1,
    repeatTexture: true,
  });

  const updateState = (partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar UI */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-200 shadow-lg z-10">
        <Controls state={state} onChange={updateState} />
      </aside>

      {/* 3D Canvas Area */}
      <main className="flex-1 relative bg-slate-900">
        
        {/* Object Selector Overlay */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-xl flex gap-2 border border-gray-200/50">
           <button 
             onClick={() => updateState({ shape: ShapeType.Cube })}
             className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${state.shape === ShapeType.Cube ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             Cubo
           </button>
           <button 
             onClick={() => updateState({ shape: ShapeType.Sphere })}
             className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${state.shape === ShapeType.Sphere ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             Esfera
           </button>
        </div>

        {/* Play/Pause Button for AutoRotate in Viewport */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => updateState({ autoRotate: !state.autoRotate })}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-3 rounded-full transition-all duration-200 shadow-lg group"
            title={state.autoRotate ? "Pausar rotación" : "Iniciar rotación"}
          >
            {state.autoRotate ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
        </div>

        <Canvas shadows camera={{ position: [4, 4, 6], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center text-white gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Cargando Textura...</span>
              </div>
            </Html>
          }>
            <color attach="background" args={['#0f172a']} />
            
            <Stage environment="city" intensity={0.6} adjustCamera={false}>
              <MappedObject 
                shape={state.shape} 
                projection={state.projection} 
                axis={state.axis} 
                blenderMode={state.blenderMode}
                offsetX={state.offsetX}
                offsetY={state.offsetY}
                offsetZ={state.offsetZ}
                tiling={state.tiling}
                repeatTexture={state.repeatTexture}
              />
            </Stage>

            <Grid 
              renderOrder={-1} 
              position={[0, -1.5, 0]} 
              infiniteGrid 
              cellSize={0.6} 
              sectionSize={3} 
              fadeDistance={30} 
              sectionColor="#475569" 
              cellColor="#334155" 
            />
            
            <OrbitControls autoRotate={state.autoRotate} autoRotateSpeed={2} makeDefault />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>

        {/* Current Mode Indicator */}
        <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md text-white p-4 rounded-xl border border-white/10 max-w-xs text-right pointer-events-none">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Modo Actual</p>
          <h2 className="text-xl font-bold capitalize mt-1">{state.projection}</h2>
          <p className="text-sm text-gray-300 mt-1">
             Objeto: <span className="capitalize">{state.shape === 'cube' ? 'Cubo' : 'Esfera'}</span>
          </p>
          {state.projection !== 'box' && (
             <p className="text-sm text-gray-300">Eje: <span className="uppercase text-blue-400 font-bold">{state.axis}</span></p>
          )}
          {state.blenderMode && (
             <p className="text-xs text-[#ea7600] font-bold mt-2 border-t border-white/10 pt-2">MODO BLENDER ACTIVADO</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
