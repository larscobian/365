
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bitcoin, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';

type Timeframe = '1H' | '4H' | '12H' | '1D' | '1W' | '1M';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const fetchBinanceData = async (timeframe: Timeframe): Promise<CandleData[]> => {
    const intervalMap: Record<Timeframe, string> = {
        '1H': '1h',
        '4H': '4h',
        '12H': '12h',
        '1D': '1d',
        '1W': '1w',
        '1M': '1M',
    };

    try {
        // Limit 500 candles for good history
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalMap[timeframe]}&limit=500`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Invalid data format from Binance", data);
            return [];
        }

        return data.map((d: any) => {
            const date = new Date(d[0]);
            let timeStr = '';
            // Format date based on timeframe granularity
            if (['1H', '4H', '12H'].includes(timeframe)) {
                timeStr = date.toLocaleString('es-ES', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
            } else {
                timeStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' });
            }

            return {
                time: timeStr,
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
            };
        });
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return [];
    }
};

const BitcoinChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [allData, setAllData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Viewport State
  const [visibleCandles, setVisibleCandles] = useState(40); // Zoom level
  const [offset, setOffset] = useState(0); // 0 = looking at latest data. Increases as you scroll back.
  
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const startOffset = useRef<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    setError(false);
    const data = await fetchBinanceData(timeframe);
    if (data.length > 0) {
        setAllData(data);
        setOffset(0); // Reset view to latest
    } else {
        setError(true);
    }
    setIsLoading(false);
    setHoveredCandle(null);
  };

  // Initialize data
  useEffect(() => {
    loadData();
    
    // Optional: Refresh every minute to keep price "live"
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [timeframe]);

  // Resize Observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Slice data for current view
  const visibleData = useMemo(() => {
    if (allData.length === 0) return [];
    
    // Calculate indices
    const end = allData.length - offset;
    const start = Math.max(0, end - visibleCandles);
    
    return allData.slice(start, end);
  }, [allData, offset, visibleCandles]);

  // Calculate Chart Scales based on VISIBLE data only
  const { minPrice, maxPrice, priceRange, candleWidth, gap } = useMemo(() => {
    if (visibleData.length === 0) return { minPrice: 0, maxPrice: 0, priceRange: 1, candleWidth: 0, gap: 0 };
    
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const d of visibleData) {
        if (d.low < minPrice) minPrice = d.low;
        if (d.high > maxPrice) maxPrice = d.high;
    }

    // Add some padding to top/bottom price
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice -= padding;
    maxPrice += padding;
    const priceRange = maxPrice - minPrice;
    
    const paddingX = 10;
    const availableWidth = dimensions.width - (paddingX * 2);
    
    // Dynamic calculations
    const gapRatio = 0.2; // Gap is 20% of a candle slot
    const slotWidth = availableWidth / visibleData.length;
    const gap = slotWidth * gapRatio;
    const candleWidth = slotWidth - gap;
    
    return { minPrice, maxPrice, priceRange, candleWidth, gap };
  }, [visibleData, dimensions]);

  const getY = (price: number) => {
    const paddingY = 20;
    const chartHeight = dimensions.height - (paddingY * 2);
    const normalized = (price - minPrice) / priceRange;
    return dimensions.height - paddingY - (normalized * chartHeight);
  };

  // Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startOffset.current = offset;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
        // Update hover logic
        if (!containerRef.current || visibleData.length === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 10; // -10 for padding
        const slotWidth = candleWidth + gap;
        const index = Math.floor(x / slotWidth);
        
        if (index >= 0 && index < visibleData.length) {
            setHoveredCandle(visibleData[index]);
        } else {
            setHoveredCandle(null);
        }
        return;
    }

    // Dragging Logic
    const deltaX = e.clientX - dragStartX.current;
    const slotWidth = (dimensions.width - 20) / visibleCandles;
    const deltaCandles = Math.round(deltaX / slotWidth);
    
    // Dragging Right (positive X) -> Move into history (Increase offset)
    let newOffset = startOffset.current + deltaCandles;
    
    // Clamp offset
    const maxOffset = allData.length - visibleCandles;
    newOffset = Math.max(0, Math.min(maxOffset, newOffset));
    
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const handleWheel = (e: React.WheelEvent) => {
      // Logic: Scroll Down (positive) -> Zoom Out (more candles)
      // Logic: Scroll Up (negative) -> Zoom In (less candles)
      
      const zoomSpeed = Math.max(1, Math.floor(visibleCandles * 0.1)); 
      const delta = e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
      
      let newCount = visibleCandles + delta;
      
      // Clamp Zoom
      newCount = Math.max(10, Math.min(150, newCount)); // Min 10 candles, Max 150
      
      // Clamp offset if zooming out hits the end of data
      if (offset + newCount > allData.length) {
          setOffset(Math.max(0, allData.length - newCount));
      }

      setVisibleCandles(newCount);
  };

  const currentDisplayData = hoveredCandle || visibleData[visibleData.length - 1];
  const isPositive = currentDisplayData ? currentDisplayData.close >= currentDisplayData.open : true;
  const priceColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-[#1c1f2e] p-6 rounded-2xl border border-gray-800/50 flex flex-col h-full min-h-[300px] relative group select-none">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 z-10 pointer-events-none">
        {/* Left: Title & Price */}
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                <Bitcoin size={20} className="text-orange-500" />
             </div>
             <span className="text-gray-300 font-medium">Bitcoin Live</span>
             {isLoading && <span className="text-xs text-gray-500 animate-pulse ml-2">Updating...</span>}
             {error && (
                 <div className="flex items-center gap-1 text-red-400 text-xs ml-2">
                     <AlertCircle size={12} />
                     <span>Error</span>
                 </div>
             )}
          </div>
          
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-white">
              ${currentDisplayData?.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
            </h2>
            {currentDisplayData && (
               <span className={`text-sm font-medium ${priceColor} flex items-center`}>
                 {isPositive ? '+' : ''}{((currentDisplayData.close - currentDisplayData.open) / currentDisplayData.open * 100).toFixed(2)}%
               </span>
            )}
          </div>
          <div className="flex gap-4 mt-1 text-[10px] text-gray-500 font-mono">
             {currentDisplayData && (
                <span className="text-blue-400 font-bold">{currentDisplayData.time}</span>
             )}
             {currentDisplayData && (
                 <>
                    <span>H: {currentDisplayData.high.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span>L: {currentDisplayData.low.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span>O: {currentDisplayData.open.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </>
             )}
          </div>
        </div>

        {/* Right: Timeframe Selectors & Refresh */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
                <button 
                    onClick={loadData} 
                    disabled={isLoading}
                    className="p-1.5 bg-[#0f111a] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
                
                {/* Zoom Controls */}
                <div className="flex items-center bg-[#0f111a] rounded-lg border border-gray-800/50">
                    <button 
                        onClick={() => setVisibleCandles(Math.max(10, visibleCandles - 10))}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-l-lg transition-colors"
                        title="Zoom In"
                    >
                        <Plus size={14} />
                    </button>
                    <button 
                        onClick={() => setVisibleCandles(Math.min(150, visibleCandles + 10))}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-r-lg transition-colors"
                        title="Zoom Out"
                    >
                        <Minus size={14} />
                    </button>
                </div>
            </div>

            {/* Timeframes */}
            <div className="flex bg-[#0f111a] p-1 rounded-lg border border-gray-800/50 overflow-x-auto max-w-[220px] sm:max-w-none scrollbar-hide">
            {(['1H', '4H', '12H', '1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    timeframe === tf 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                >
                {tf}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full relative cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
         {/* Grid Lines */}
         <div className="absolute inset-0 pointer-events-none opacity-20">
            {[0.25, 0.5, 0.75].map(pct => (
                <div key={pct} className="absolute w-full border-t border-gray-600 border-dashed" style={{ top: `${pct * 100}%` }} />
            ))}
         </div>

         {dimensions.width > 0 && dimensions.height > 0 && visibleData.length > 0 && (
           <svg width={dimensions.width} height={dimensions.height} className="overflow-visible block pointer-events-none">
             {visibleData.map((candle, index) => {
               const x = 10 + index * (candleWidth + gap); // 10px padding left
               const yOpen = getY(candle.open);
               const yClose = getY(candle.close);
               const yHigh = getY(candle.high);
               const yLow = getY(candle.low);
               
               const isBullish = candle.close >= candle.open;
               const color = isBullish ? '#22c55e' : '#ef4444';
               
               let bodyHeight = Math.abs(yClose - yOpen);
               if (bodyHeight < 1) bodyHeight = 1;
               const bodyY = Math.min(yOpen, yClose);

               // Skip rendering if off-screen (extra safety)
               if (x + candleWidth < 0 || x > dimensions.width) return null;

               const isHovered = hoveredCandle === candle;

               return (
                 <g key={index} className="transition-opacity duration-200">
                    {/* Wick */}
                    <line 
                        x1={x + candleWidth / 2} 
                        y1={yHigh} 
                        x2={x + candleWidth / 2} 
                        y2={yLow} 
                        stroke={color} 
                        strokeWidth={isHovered ? 2 : 1}
                        opacity={isHovered ? 1 : 0.7}
                    />
                    
                    {/* Body */}
                    <rect
                        x={x}
                        y={bodyY}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={color}
                        rx={1}
                        opacity={isHovered ? 1 : 0.9}
                        stroke={isHovered ? 'white' : 'none'}
                        strokeWidth={1}
                    />
                 </g>
               );
             })}

             {/* Crosshair Line for Hover */}
             {hoveredCandle && (
                 <>
                    {/* Horizontal Price Line */}
                    <line 
                        x1={0} 
                        y1={getY(hoveredCandle.close)} 
                        x2={dimensions.width} 
                        y2={getY(hoveredCandle.close)} 
                        stroke="#9ca3af" 
                        strokeDasharray="4 4" 
                        strokeWidth={0.5}
                        opacity={0.5}
                    />
                    {/* Price Label on Right Axis */}
                    <g transform={`translate(${dimensions.width - 60}, ${getY(hoveredCandle.close)})`}>
                        <rect x={0} y={-10} width={60} height={20} fill="#1f2937" rx={4} />
                        <text x={30} y={4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                            ${hoveredCandle.close.toLocaleString()}
                        </text>
                    </g>
                 </>
             )}
           </svg>
         )}

         {/* Loading State or No Data */}
         {isLoading && visibleData.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-20 bg-[#1c1f2e]/80">
                 Loading Market Data...
             </div>
         )}
         
         {!isLoading && visibleData.length === 0 && error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 text-sm gap-2">
                 <AlertCircle size={24} />
                 <span>Failed to load data. Check connection.</span>
                 <button onClick={loadData} className="text-blue-400 hover:underline mt-2">Retry</button>
             </div>
         )}
         
         {/* Scroll Hint Overlay (fades out) */}
         <div className="absolute bottom-2 right-4 text-[10px] text-gray-600 pointer-events-none opacity-50">
             Scroll to zoom • Drag to pan
         </div>
      </div>
    </div>
  );
};

export default BitcoinChart;