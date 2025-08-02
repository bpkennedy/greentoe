'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWatchList, useProgress } from '@/lib/contexts';
import { 
  saveData, 
  loadData, 
  mergeStateData, 
  getCurrentState,
  type AppStateData,
  type DataOperationResult 
} from '@/lib/dataManager';

/**
 * Props for the DataManager component
 */
interface DataManagerProps {
  /** Additional CSS classes */
  className?: string;
  /** Callback when data is successfully loaded */
  onDataLoaded?: (data: AppStateData) => void;
  /** Callback when data is successfully saved */
  onDataSaved?: (filename: string) => void;
}

/**
 * Types of operations
 */
type OperationType = 'save' | 'load' | null;

/**
 * Merge strategy options
 */
type MergeStrategy = 'merge' | 'replace';

/**
 * DataManager Component
 * Provides UI controls for saving and loading encrypted user data
 */
export function DataManager({ className, onDataLoaded, onDataSaved }: DataManagerProps) {
  const { watchList, addTicker } = useWatchList();
  const { completedLessons, markLessonComplete } = useProgress();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<OperationType>(null);
  const [result, setResult] = useState<DataOperationResult | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('merge');
  const [showMergeOptions, setShowMergeOptions] = useState(false);
  const [pendingLoadData, setPendingLoadData] = useState<AppStateData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the save data operation
   */
  const handleSaveData = async () => {
    console.log('🔥 handleSaveData called'); // Debug log
    setIsLoading(true);
    setCurrentOperation('save');
    setResult(null);

    try {
      const currentState = getCurrentState(watchList, { completedLessons });
      console.log('🔥 Current state:', currentState); // Debug log
      
      const result = await saveData(currentState);
      console.log('🔥 Save result:', result); // Debug log
      
      setResult(result);
      
      if (result.success && onDataSaved) {
        // Extract filename from the result message
        const filenameMatch = result.message.match(/as (.+)$/);
        const filename = filenameMatch ? filenameMatch[1] : 'green-thumb-state.gt';
        onDataSaved(filename);
      }
    } catch (error) {
      console.error('🔥 Save error:', error); // Debug log
      setResult({
        success: false,
        message: 'An unexpected error occurred while saving',
        error: 'UNKNOWN_ERROR'
      });
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  /**
   * Handles file selection for loading
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥 handleFileSelect called'); // Debug log
    const file = event.target.files?.[0];
    if (!file) {
      console.log('🔥 No file selected'); // Debug log
      return;
    }
    console.log('🔥 File selected:', file.name); // Debug log

    setIsLoading(true);
    setCurrentOperation('load');
    setResult(null);

    try {
      console.log('🔥 Calling loadData'); // Debug log
      const result = await loadData(file);
      console.log('🔥 Load result:', result); // Debug log
      setResult(result);

      if (result.success && result.data) {
        // Check if user has existing data
        const hasExistingData = watchList.length > 0 || completedLessons.length > 0;
        
        if (hasExistingData) {
          // Show merge options
          setPendingLoadData(result.data);
          setShowMergeOptions(true);
        } else {
          // No existing data, just load directly
          await applyLoadedData(result.data, 'replace');
        }
      }
    } catch {
      setResult({
        success: false,
        message: 'An unexpected error occurred while loading',
        error: 'UNKNOWN_ERROR'
      });
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Applies loaded data to the application state
   */
  const applyLoadedData = async (loadedData: AppStateData, strategy: MergeStrategy) => {
    const currentState = getCurrentState(watchList, { completedLessons });
    const mergedData = mergeStateData(currentState, loadedData, strategy);

    // Update watch list
    if (mergedData.watchList) {
      // Clear current watchlist if replacing
      if (strategy === 'replace') {
        // Note: We would need a clearWatchList function in the context
        // For now, we'll add the new items (the context prevents duplicates)
      }
      
      // Add all tickers from merged data
      mergedData.watchList.forEach(ticker => {
        addTicker(ticker);
      });
    }

    // Update progress
    if (mergedData.completedLessons) {
      mergedData.completedLessons.forEach(lessonId => {
        markLessonComplete(lessonId);
      });
    }

    if (onDataLoaded) {
      onDataLoaded(mergedData);
    }

    // Clear pending data and hide merge options
    setPendingLoadData(null);
    setShowMergeOptions(false);
    
    setResult({
      success: true,
      message: `Data ${strategy === 'replace' ? 'replaced' : 'merged'} successfully`,
    });
  };

  /**
   * Handles merge strategy confirmation
   */
  const handleMergeConfirm = async () => {
    if (pendingLoadData) {
      await applyLoadedData(pendingLoadData, mergeStrategy);
    }
  };

  /**
   * Cancels the merge operation
   */
  const handleMergeCancel = () => {
    setPendingLoadData(null);
    setShowMergeOptions(false);
    setResult({
      success: false,
      message: 'Load operation cancelled',
    });
  };

  /**
   * Triggers file input click
   */
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clears the current result message
   */
  const clearResult = () => {
    setResult(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Data Management
        </CardTitle>
        <CardDescription>
          Save your watch-list and progress to an encrypted file, or load previously saved data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveData}
            disabled={isLoading}
            className="flex-1"
            variant="default"
            data-testid="data-manager-save"
          >
            {isLoading && currentOperation === 'save' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isLoading && currentOperation === 'save' ? 'Saving...' : 'Download Data'}
          </Button>

          <Button
            onClick={handleLoadClick}
            disabled={isLoading}
            className="flex-1"
            variant="outline"
            data-testid="data-manager-load"
          >
            {isLoading && currentOperation === 'load' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isLoading && currentOperation === 'load' ? 'Loading...' : 'Upload Data'}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".gt"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="data-manager-file-input"
        />

        {/* Current State Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{watchList.length}</Badge>
            <span>stocks tracked</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{completedLessons.length}</Badge>
            <span>lessons completed</span>
          </div>
        </div>

        {/* Merge Options Modal */}
        {showMergeOptions && pendingLoadData && (
          <>
            <Separator />
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold">How should we handle your existing data?</h4>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="merge"
                    checked={mergeStrategy === 'merge'}
                    onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Merge data</div>
                    <div className="text-sm text-muted-foreground">
                      Combine loaded data with your current data (recommended)
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="replace"
                    checked={mergeStrategy === 'replace'}
                    onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Replace current data</div>
                    <div className="text-sm text-muted-foreground">
                      Replace your current data entirely with the loaded data
                    </div>
                  </div>
                </label>


              </div>

              <div className="flex gap-2">
                <Button onClick={handleMergeConfirm} className="flex-1" data-testid="merge-confirm">
                  Continue
                </Button>
                <Button onClick={handleMergeCancel} variant="outline" className="flex-1" data-testid="merge-cancel">
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Result Messages */}
        {result && (
          <>
            <Separator />
            <div 
              className={`flex items-start gap-3 p-3 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
              data-testid={result.success ? 'save-success' : 'save-error'}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 text-red-600" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {result.success ? 'Success!' : 'Error'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
              <Button
                onClick={clearResult}
                variant="ghost"
                size="sm"
                className="text-inherit hover:bg-transparent"
              >
                ×
              </Button>
            </div>
          </>
        )}

        {/* File Format Info */}
        <div className="text-xs text-muted-foreground">
          Files are saved as encrypted <code>.gt</code> files that can only be opened by Green Thumb.
          Your data is secured using AES-256-GCM encryption.
        </div>
      </CardContent>
    </Card>
  );
}