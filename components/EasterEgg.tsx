import React, { useEffect, useState } from 'react';

const icons = [
  // Graduation Cap
  `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22,9.45L12,4.45L2,9.45L12,14.45L22,9.45M4.14,10.64L12,15.11L19.86,10.64L12,6.16L4.14,10.64M12,16L3,11V17L12,22L21,17V11L12,16Z"/></svg>`,
  // Open Book
  `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 12H20V13.5C20 16 18.5 18.5 13 18.5C10.5 18.5 8 16 8 13.5V12H11M18 20V22H6V20H18M13 2C8.5 2 5 5.5 5 10V11H19V10C19 5.5 15.5 2 13 2Z"/></svg>`,
  // Lightbulb
  `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/></svg>`,
];

interface EasterEggProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const EasterEgg: React.FC<EasterEggProps> = ({ x, y, onComplete }) => {
    const [icon] = useState(() => icons[Math.floor(Math.random() * icons.length)]);

    useEffect(() => {
        const timer = setTimeout(onComplete, 1000); // Animation duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="fixed text-primary-400 pointer-events-none z-50 animate-pop-out"
            style={{
                left: x,
                top: y,
                width: '32px',
                height: '32px',
                transform: 'translate(-50%, -50%)'
            }}
            dangerouslySetInnerHTML={{ __html: icon }}
        >
             <style>
                {`
                    @keyframes pop-out {
                        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    }
                    .animate-pop-out {
                        animation: pop-out 1s ease-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default EasterEgg;