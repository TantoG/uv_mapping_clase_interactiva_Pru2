
import React from 'react';
import { Box, Circle, Grid3X3, BoxSelect, Globe, Cylinder, Move3d, ToggleLeft, ToggleRight, RotateCcw, Grid2X2, Repeat } from 'lucide-react';
import { AppState, ShapeType, ProjectionType, Axis } from '../types';
import clsx from 'clsx';

interface ControlsProps {
  state: AppState;
  onChange: (partial: Partial<AppState>) => void;
}

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 first:mt-0">
    {children}
  </h3>
);

interface ButtonProps { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  active, 
  onClick, 
  children, 
  className 
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center justify-center gap-2 p-2.5 rounded-lg transition-all duration-200 border text-sm font-medium w-full",
      active 
        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/20" 
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
      className
    )}
  >
    {children}
  </button>
);

const SliderControl: React.FC<{ label: string; value: number; onChange: (val: number) => void; min: number; max: number; step?: number }> = ({ label, value, onChange, min, max, step = 0.01 }) => (
  <div className="mb-3 last:mb-0">
    <div className="flex justify-between mb-1">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

const Controls: React.FC<ControlsProps> = ({ state, onChange }) => {
  
  // Helper to get axis description based on mode
  const getAxisLabel = (axis: Axis) => {
    if (state.blenderMode) {
      switch (axis) {
        case Axis.X: return "X (Lado)";
        case Axis.Y: return "Y (Fondo)";
        case Axis.Z: return "Z (Arriba)";
      }
    } else {
      switch (axis) {
        case Axis.X: return "X (Lado)";
        case Axis.Y: return "Y (Arriba)";
        case Axis.Z: return "Z (Fondo)";
      }
    }
    return (axis as unknown as string).toUpperCase();
  };

  const handleReset = () => {
    onChange({ offsetX: 0, offsetY: 0, offsetZ: 0, tiling: 1, repeatTexture: true });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Move3d className="w-8 h-8 text-blue-600" />
          Texture Mapping
        </h1>
        <p className="text-sm text-gray-500 mt-1">Probá todas las posibilidades de mapeo de textura</p>
      </div>

      {/* Object Selection */}
      <SectionTitle>Objeto 3D</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          active={state.shape === ShapeType.Cube} 
          onClick={() => onChange({ shape: ShapeType.Cube })}
        >
          <Box className="w-5 h-5" /> Cubo
        </Button>
        <Button 
          active={state.shape === ShapeType.Sphere} 
          onClick={() => onChange({ shape: ShapeType.Sphere })}
        >
          <Circle className="w-5 h-5" /> Esfera
        </Button>
      </div>

      {/* Projection Selection */}
      <SectionTitle>Tipo de Proyección</SectionTitle>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          active={state.projection === ProjectionType.Planar} 
          onClick={() => onChange({ projection: ProjectionType.Planar })}
        >
          <Grid3X3 className="w-4 h-4" /> Planar (Plana)
        </Button>
        <Button 
          active={state.projection === ProjectionType.Box} 
          onClick={() => onChange({ projection: ProjectionType.Box })}
        >
          <BoxSelect className="w-4 h-4" /> Box (Cúbica)
        </Button>
        <Button 
          active={state.projection === ProjectionType.Cylindrical} 
          onClick={() => onChange({ projection: ProjectionType.Cylindrical })}
        >
          <Cylinder className="w-4 h-4" /> Cylindrical (Cilíndrica)
        </Button>
        <Button 
          active={state.projection === ProjectionType.Spherical} 
          onClick={() => onChange({ projection: ProjectionType.Spherical })}
        >
          <Globe className="w-4 h-4" /> Spherical (Esférica)
        </Button>
      </div>

      {/* Axis Selection - Only for relevant projections */}
      {(state.projection === ProjectionType.Planar || 
        state.projection === ProjectionType.Cylindrical ||
        state.projection === ProjectionType.Spherical) && (
        <>
          <SectionTitle>Eje de Proyección</SectionTitle>
          <div className="flex flex-col gap-2">
             <div className="flex gap-2">
              <Button 
                active={state.axis === Axis.X} 
                onClick={() => onChange({ axis: Axis.X })}
                className="flex-1"
              >
                {getAxisLabel(Axis.X)}
              </Button>
             </div>
             <div className="flex gap-2">
              <Button 
                active={state.axis === Axis.Y} 
                onClick={() => onChange({ axis: Axis.Y })}
                className="flex-1"
              >
                {getAxisLabel(Axis.Y)}
              </Button>
              <Button 
                active={state.axis === Axis.Z} 
                onClick={() => onChange({ axis: Axis.Z })}
                className="flex-1"
              >
                {getAxisLabel(Axis.Z)}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Texture Controls */}
      <SectionTitle>Control de Textura</SectionTitle>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
            <Move3d className="w-3 h-3" /> Posición (Offset)
          </h4>
          <SliderControl 
            label="Mover X" 
            value={state.offsetX} 
            onChange={(val) => onChange({ offsetX: val })} 
            min={-2} max={2}
          />
          <SliderControl 
            label="Mover Y" 
            value={state.offsetY} 
            onChange={(val) => onChange({ offsetY: val })} 
            min={-2} max={2}
          />
          <SliderControl 
            label="Mover Z" 
            value={state.offsetZ} 
            onChange={(val) => onChange({ offsetZ: val })} 
            min={-2} max={2}
          />
        </div>
        
        <div className="border-t border-gray-200 pt-3">
           <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
            <Grid2X2 className="w-3 h-3" /> Escala (Tiling)
          </h4>
          <SliderControl 
            label="Repetición" 
            value={state.tiling} 
            onChange={(val) => onChange({ tiling: val })} 
            min={1} max={10} step={1}
          />
        </div>

        <div className="border-t border-gray-200 pt-3">
          <Button 
            active={state.repeatTexture} 
            onClick={() => onChange({ repeatTexture: !state.repeatTexture })}
            className={state.repeatTexture ? "bg-green-600 border-green-600 text-white" : ""}
          >
            <Repeat className="w-4 h-4" />
            {state.repeatTexture ? "Repetir Textura: SI" : "Repetir Textura: NO"}
          </Button>
          {!state.repeatTexture && (
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              Mostrando verde chroma fuera de rango
            </p>
          )}
        </div>

        <button 
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors mt-2"
        >
          <RotateCcw className="w-3 h-3" /> Reset Valores
        </button>
      </div>

      {/* Misc Controls */}
      <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
        <SectionTitle>Configuración</SectionTitle>
        
        <Button 
          active={state.blenderMode} 
          onClick={() => onChange({ blenderMode: !state.blenderMode })}
          className={state.blenderMode 
            ? "!bg-[#ea7600] !border-[#ea7600] text-white shadow-orange-200 shadow-md" 
            : ""
          }
        >
          {state.blenderMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          MODO BLENDER {state.blenderMode ? 'ON' : 'OFF'}
        </Button>

        <label className="flex items-center gap-3 p-2 cursor-pointer select-none text-gray-700 hover:bg-gray-50 rounded-lg">
          <input 
            type="checkbox" 
            checked={state.autoRotate}
            onChange={(e) => onChange({ autoRotate: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Rotación Automática</span>
        </label>
      </div>
    </div>
  );
};

export default Controls;
