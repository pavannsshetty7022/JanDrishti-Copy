import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="issue-card" style={{ opacity: 0.7 }}>
            <div className="d-flex justify-content-between mb-3">
                <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '50px' }}></div>
                <div className="skeleton" style={{ width: '40px', height: '15px' }}></div>
            </div>
            <div className="skeleton mb-3" style={{ width: '100%', height: '24px' }}></div>
            <div className="issue-meta mb-3">
                <div className="skeleton" style={{ width: '80%', height: '15px' }}></div>
                <div className="skeleton" style={{ width: '70%', height: '15px' }}></div>
                <div className="skeleton" style={{ width: '60%', height: '15px' }}></div>
            </div>
            <div className="issue-footer mt-auto">
                <div className="skeleton" style={{ width: '40%', height: '15px' }}></div>
                <div className="skeleton" style={{ width: '80px', height: '35px', borderRadius: '12px' }}></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
