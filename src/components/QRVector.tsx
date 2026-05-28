/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QRVectorProps {
  value: string;
  size?: number;
}

export default function QRVector({ value, size = 120 }: QRVectorProps) {
  // Generate deterministic grid pattern based on string value
  const gridSize = 21; // Standard Version 1 QR matrix size
  const points: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

  // Determine hash from value
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Draw positioning finders
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (r + i < gridSize && c + j < gridSize) {
          points[r + i][c + j] = isBorder || isCenter;
        }
      }
    }
  };

  // Top-Left Finder
  drawFinder(0, 0);
  // Top-Right Finder
  drawFinder(0, gridSize - 7);
  // Bottom-Left Finder
  drawFinder(gridSize - 7, 0);

  // Alignment Finder equivalent standard alignment patterns
  if (gridSize > 15) {
    points[gridSize - 5][gridSize - 5] = true;
    points[gridSize - 5][gridSize - 6] = true;
    points[gridSize - 6][gridSize - 5] = true;
  }

  // Draw deterministic random bits based on the simple hash generator
  let tempHash = Math.abs(hash);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders
      const isFinder = (r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8);
      if (!isFinder) {
        tempHash = (tempHash * 1103515245 + 12345) & 0x7fffffff;
        points[r][c] = (tempHash % 3) === 0;
      }
    }
  }

  return (
    <div 
      id={`qr-container-${value}`}
      className="p-3 bg-white rounded-lg flex flex-col items-center justify-center border border-[#1F222B]"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        shapeRendering="crispEdges"
        className="text-[#0A0B0E]"
      >
        <rect width={gridSize} height={gridSize} fill="white" />
        {points.map((row, r) =>
          row.map((active, c) => (
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                className="fill-current text-[#0A0B0E]"
              />
            ) : null
          ))
        )}
      </svg>
      <div className="text-[9px] font-mono font-bold mt-1.5 text-[#0A0B0E] truncate w-full text-center tracking-tight">
        {value}
      </div>
    </div>
  );
}
