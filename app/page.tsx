'use client';

import { useState, useEffect } from 'react';
import { Heart, Palette, Sparkles, Leaf, Sunset, Coffee, Brush, Menu, Moon, Sun, Pin, PinOff } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

interface ColorPalette {
  id: string;
  colors: string[];
  likes: number;
  timestamp: string;
}

type PaletteType = 'random' | 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'earthy' | 'pastel';

const PALETTE_TYPES: Record<PaletteType, { name: string; icon: React.ReactNode }> = {
  random: { name: 'Rastgele', icon: <Sparkles className="w-5 h-5" /> },
  monochromatic: { name: 'Monokromatik', icon: <Palette className="w-5 h-5" /> },
  analogous: { name: 'Analog', icon: <Brush className="w-5 h-5" /> },
  complementary: { name: 'Tamamlayıcı', icon: <Sunset className="w-5 h-5" /> },
  triadic: { name: 'Üçlü', icon: <Palette className="w-5 h-5" /> },
  earthy: { name: 'Doğal', icon: <Leaf className="w-5 h-5" /> },
  pastel: { name: 'Pastel', icon: <Coffee className="w-5 h-5" /> },
};

function generateUniqueId(): string {
  return `palette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function Home() {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [customColors, setCustomColors] = useState<string[]>(Array(4).fill('#ffffff'));
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<PaletteType>('random');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    // Load palettes from localStorage if available
    const savedPalettes = localStorage.getItem('colorPalettes');
    if (savedPalettes) {
      setPalettes(JSON.parse(savedPalettes));
    }
  }, []);

  // Save palettes to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('colorPalettes', JSON.stringify(palettes));
    }
  }, [palettes, mounted]);

  // Handle window resize for sidebar behavior
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 1024) {
        setIsSidebarPinned(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const adjustColor = (color: string, amount: number): string => {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };

  const generatePaletteColors = (type: PaletteType): string[] => {
    switch (type) {
      case 'monochromatic': {
        const baseColor = generateRandomColor();
        return [
          baseColor,
          adjustColor(baseColor, 20),
          adjustColor(baseColor, 40),
          adjustColor(baseColor, 60),
        ];
      }
      case 'analogous': {
        const hue = Math.floor(Math.random() * 360);
        return [
          `hsl(${hue}, 70%, 50%)`,
          `hsl(${(hue + 30) % 360}, 70%, 50%)`,
          `hsl(${(hue + 60) % 360}, 70%, 50%)`,
          `hsl(${(hue + 90) % 360}, 70%, 50%)`,
        ].map(hslToHex);
      }
      case 'complementary': {
        const hue = Math.floor(Math.random() * 360);
        return [
          `hsl(${hue}, 70%, 50%)`,
          `hsl(${hue}, 60%, 60%)`,
          `hsl(${(hue + 180) % 360}, 70%, 50%)`,
          `hsl(${(hue + 180) % 360}, 60%, 60%)`,
        ].map(hslToHex);
      }
      case 'triadic': {
        const hue = Math.floor(Math.random() * 360);
        return [
          `hsl(${hue}, 70%, 50%)`,
          `hsl(${(hue + 120) % 360}, 70%, 50%)`,
          `hsl(${(hue + 240) % 360}, 70%, 50%)`,
          `hsl(${hue}, 70%, 60%)`,
        ].map(hslToHex);
      }
      case 'earthy': {
        const earthyColors = ['#7C4A3C', '#8B593E', '#947661', '#A89076', '#C4A484', '#B8926A', '#785E49', '#6B4423'];
        const shuffled = [...earthyColors].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
      }
      case 'pastel': {
        const pastelColors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFB3F7', '#B3FFF7', '#FFC8BA', '#C8BAFF'];
        const shuffled = [...pastelColors].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
      }
      default:
        return Array(4).fill(null).map(() => generateRandomColor());
    }
  };

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#000000';

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = () => {
    if (!mounted) return;
    
    const newColors = generatePaletteColors(selectedType);
    const newPalette: ColorPalette = {
      id: generateUniqueId(),
      colors: newColors,
      likes: 0,
      timestamp: new Date().toLocaleString('tr-TR', { hour12: false })
    };
    setPalettes(prev => [newPalette, ...prev]);
  };

  const handleColorChange = (index: number, color: string) => {
    setCustomColors(prev => {
      const newColors = [...prev];
      newColors[index] = color;
      return newColors;
    });
  };

  const savePalette = () => {
    if (!mounted) return;

    const newPalette: ColorPalette = {
      id: generateUniqueId(),
      colors: customColors,
      likes: 0,
      timestamp: new Date().toLocaleString('tr-TR', { hour12: false })
    };
    setPalettes(prev => [newPalette, ...prev]);
  };

  const copyToClipboard = (color: string) => {
    if (mounted) {
      navigator.clipboard.writeText(color);
      toast.success('Renk kodu kopyalandı!', {
        description: color,
      });
    }
  };

  const toggleSidebar = () => {
    if (!isSidebarPinned) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-20 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-10 w-64 bg-gray-100 dark:bg-gray-800 p-6 space-y-6 transform transition-all duration-200 ease-in-out ${
          isSidebarOpen || (isSidebarPinned && windowWidth >= 1024) ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => {
          if (!isSidebarPinned && windowWidth >= 1024) {
            setIsSidebarOpen(false);
          }
        }}
      >
        <div className="flex items-center justify-between text-gray-800 dark:text-white mb-8">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Palet Türleri</h2>
          </div>
          <button
            onClick={() => {
              setIsSidebarPinned(!isSidebarPinned);
              if (!isSidebarPinned) {
                setIsSidebarOpen(true);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden lg:block"
            title={isSidebarPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
          >
            {isSidebarPinned ? (
              <Pin className="w-4 h-4" />
            ) : (
              <PinOff className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="space-y-2">
          {(Object.entries(PALETTE_TYPES) as [PaletteType, { name: string; icon: React.ReactNode }][]).map(([type, { name, icon }]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {icon}
              <span>{name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Sidebar Reveal Trigger */}
      {!isSidebarPinned && windowWidth >= 1024 && !isSidebarOpen && (
        <div
          className="fixed left-0 top-0 bottom-0 w-2 group hover:w-6 transition-all duration-200 z-10"
          onMouseEnter={() => setIsSidebarOpen(true)}
        >
          <div className="absolute inset-y-0 left-0 w-full bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {/* Main Content */}
      <main 
        className={`flex-1 p-8 transition-all duration-200 ${
          (isSidebarOpen || isSidebarPinned) && windowWidth >= 1024 ? 'lg:ml-64' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">Renk Paleti Oluşturucu</h1>
          
          <div className="mb-12 space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Özel Palet Oluştur</h2>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {customColors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div 
                      className="h-24 rounded-lg relative group/color"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/30 transition-opacity">
                        <span className="text-white text-sm font-mono">{color}</span>
                      </div>
                    </div>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={savePalette}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Paleti Kaydet
              </button>
            </div>

            <button
              onClick={generatePalette}
              className="w-full py-3 px-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {PALETTE_TYPES[selectedType].name} Palet Oluştur
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {palettes.map((palette) => (
              <div
                key={palette.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
              >
                {palette.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="relative"
                  >
                    <div
                      className="h-16 cursor-pointer transition-all hover:brightness-110 group/color"
                      style={{ backgroundColor: color }}
                      onClick={() => copyToClipboard(color)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/30 transition-opacity">
                        <div className="bg-black/50 px-3 py-1 rounded-full">
                          <span className="text-white text-sm font-mono">{color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 flex items-center justify-between">
                  <button className="flex items-center space-x-1 text-white">
                    <Heart className="w-5 h-5" />
                    <span>{palette.likes}</span>
                  </button>
                  <span className="text-sm text-gray-400">{palette.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {palettes.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              Henüz hiç palet oluşturulmadı. Hemen yeni bir palet oluşturmaya başlayın!
            </div>
          )}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {(isSidebarOpen && !isSidebarPinned) && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 