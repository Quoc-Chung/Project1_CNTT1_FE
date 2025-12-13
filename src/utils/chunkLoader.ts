import React from 'react';

// Chunk loading utility with retry mechanism
export class ChunkLoader {
  private static retryCount = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000;

  static async loadChunk<T>(
    importFn: () => Promise<T>,
    chunkName?: string
  ): Promise<T> {
    try {
      const result = await importFn();
      this.retryCount = 0; // Reset retry count on success
      return result;
    } catch (error) {
      if (this.isChunkError(error) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(this.retryDelay * Math.pow(2, this.retryCount - 1), 5000);
        
        console.warn(`Chunk loading failed (attempt ${this.retryCount}/${this.maxRetries}), retrying in ${delay}ms...`, {
          chunkName,
          error: error.message
        });

        await this.delay(delay);
        return this.loadChunk(importFn, chunkName);
      }
      
      throw error;
    }
  }

  private static isChunkError(error: any): boolean {
    return error?.message?.includes('Loading chunk') || 
           error?.message?.includes('ChunkLoadError') ||
           error?.name === 'ChunkLoadError' ||
           error?.message?.includes('timeout');
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static resetRetryCount(): void {
    this.retryCount = 0;
  }
}

export function dynamicImport<T extends { default: React.ComponentType<any> }>(
  importFn: () => Promise<T>,
  options: {
    ssr?: boolean;
    loading?: () => React.ReactElement | null;
    chunkName?: string;
  } = {}
) {
  const { ssr = true, loading, chunkName } = options;

  return React.lazy(async () => {
    const loadedModule = await ChunkLoader.loadChunk(importFn, chunkName);
    return loadedModule as { default: React.ComponentType<any> };
  });
}

export function setupChunkErrorHandler() {
  if (typeof window === 'undefined') return;

  // Handle unhandled chunk loading errors
  window.addEventListener('error', (event) => {
    if (event.error && ChunkLoader['isChunkError'](event.error)) {
      console.error('Unhandled chunk loading error:', event.error);
      
      // Show user-friendly error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorMessage.textContent = 'Lỗi tải trang. Vui lòng tải lại.';
      
      document.body.appendChild(errorMessage);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && ChunkLoader['isChunkError'](event.reason)) {
      console.error('Unhandled chunk loading promise rejection:', event.reason);
      event.preventDefault(); 
    }
  });
}

// Initialize chunk error handling
if (typeof window !== 'undefined') {
  setupChunkErrorHandler();
}
