import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                height: '56px',
                width: '56px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: '#36a269',
                color: 'white',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                WebkitTransform: 'translateZ(0)',
                opacity: isVisible ? 1 : 0,
                visibility: isVisible ? 'visible' : 'hidden',
                transition: 'opacity 0.5s ease, visibility 0.5s ease, transform 0.3s ease',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)', 
            }}
            className="hover:bg-blue-700 active:scale-90"
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="40px"
                viewBox="0 -960 960 960" 
                width="40px" 
                fill="#FFFFFF"
                style={{ 
                    width: '44px',
                    height: '44px',
                    transform: 'scale(1.5)',
                    transformOrigin: 'center'
                }}
            >
                <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/>
            </svg>
        </button>
    );
};

export default ScrollToTop;