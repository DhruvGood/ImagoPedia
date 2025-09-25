import React from 'react';
import type { Mode } from '../types';
import { CameraIcon, ScanIcon, UploadIcon, FlipCameraIcon } from './Icons';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  onScan: () => void;
  onCameraReset: () => void;
  onCameraToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange, onFileSelect, isProcessing, onScan, onCameraReset, onCameraToggle }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl">
      <div className="flex items-center justify-between gap-2 bg-black/40 backdrop-blur-lg p-2 rounded-full shadow-2xl border border-white/20">
        
        {/* Left Controls */}
        <div className="flex items-center gap-1">
            <label htmlFor="file-upload" className="cursor-pointer p-2.5 rounded-full hover:bg-white/20 transition-colors">
                <UploadIcon className="w-6 h-6" />
                <input id="file-upload" ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            </label>
            <button onClick={onCameraReset} className="p-2.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Reset Camera">
                <CameraIcon className="w-6 h-6" />
            </button>
             <button onClick={onCameraToggle} className="p-2.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Flip Camera">
                <FlipCameraIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Mode Slider */}
        <div className="relative flex items-center bg-gray-700/50 rounded-full p-1">
          <span
            className={`absolute top-1 bottom-1 transition-all duration-300 ease-in-out bg-indigo-600 rounded-full shadow-md`}
            style={{
              width: 'calc(50% - 4px)',
              left: mode === 'Normal' ? '4px' : 'calc(50% + 2px)',
            }}
          />
          <button
            onClick={() => onModeChange('Normal')}
            className="relative z-10 px-6 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300"
          >
            Normal
          </button>
          <button
            onClick={() => onModeChange('Health')}
            className="relative z-10 px-6 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300"
          >
            Health
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center">
            <button
                onClick={onScan}
                disabled={isProcessing}
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Scan current view"
            >
                <ScanIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};