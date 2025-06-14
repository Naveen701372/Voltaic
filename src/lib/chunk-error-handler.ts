'use client';

// Global chunk loading error handler
export function setupChunkErrorHandler() {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections (chunk loading errors)
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;

        // Check if it's a chunk loading error
        if (
            error?.name === 'ChunkLoadError' ||
            error?.message?.includes('Loading chunk') ||
            error?.message?.includes('timeout')
        ) {
            console.warn('Chunk loading error detected:', error);

            // Prevent the error from being logged to console
            event.preventDefault();

            // Attempt to recover by reloading the page
            setTimeout(() => {
                console.log('Attempting to recover from chunk loading error...');
                window.location.reload();
            }, 1000);
        }
    });

    // Handle script loading errors
    window.addEventListener('error', (event) => {
        const target = event.target as HTMLScriptElement;

        if (target?.tagName === 'SCRIPT' && target.src?.includes('_next/static/chunks/')) {
            console.warn('Script loading error detected:', target.src);

            // Attempt to reload the failed script
            setTimeout(() => {
                const newScript = document.createElement('script');
                newScript.src = target.src;
                newScript.async = true;

                newScript.onload = () => {
                    console.log('Script reloaded successfully:', target.src);
                };

                newScript.onerror = () => {
                    console.warn('Script reload failed, refreshing page...');
                    window.location.reload();
                };

                document.head.appendChild(newScript);
            }, 1000);
        }
    });
}

// Retry mechanism for failed chunk loads
export function retryChunkLoad(chunkId: string, maxRetries = 3): Promise<void> {
    return new Promise((resolve, reject) => {
        let retries = 0;

        const attemptLoad = () => {
            // This would be called by webpack's chunk loading mechanism
            // For now, we'll just implement a basic retry with exponential backoff

            setTimeout(() => {
                retries++;

                if (retries >= maxRetries) {
                    reject(new Error(`Failed to load chunk ${chunkId} after ${maxRetries} retries`));
                    return;
                }

                // In a real implementation, this would retry the actual chunk loading
                // For now, we'll just resolve after a delay
                resolve();
            }, Math.pow(2, retries) * 1000); // Exponential backoff
        };

        attemptLoad();
    });
}

// Initialize the error handler when the module is imported
if (typeof window !== 'undefined') {
    setupChunkErrorHandler();
} 