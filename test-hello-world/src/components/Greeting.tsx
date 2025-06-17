'use client';

import React from 'react';
import './greeting.css';

export function Greeting() {
    return (
        <div className="greeting-container">
            <h1 className="greeting-title">👋 Hello, World!</h1>
            <p className="greeting-text">Welcome to my simple React app</p>
        </div>
    );
} 