import React from 'react';

interface SkeletonLoaderProps {
    className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
    return (
        <div className={`skeleton-loader ${className}`}></div>
    );
};

export default SkeletonLoader;