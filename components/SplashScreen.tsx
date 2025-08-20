import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
    const [isFading, setIsFading] = useState(false);
    const text = "Portal";

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 2000); // Start fading out before component unmounts

        return () => clearTimeout(fadeTimer);
    }, []);

    return (
        <div id="splash-screen" className={isFading ? 'animate-fade-out' : ''}>
            <h1 className="portal-text">
                {text.split('').map((char, index) => (
                    <span 
                        key={index} 
                        className="portal-text-char"
                        style={{ animationDelay: `${index * 0.15}s` }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default SplashScreen;