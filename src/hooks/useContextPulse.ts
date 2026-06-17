import { useState, useEffect, useCallback } from 'react';
import { ContextPulseSDK } from '@/sdk/ContextPulse';
import type { IntentResult, BehavioralEvent } from '@/sdk/types';

/**
 * A custom React hook that initializes the ContextPulse SDK,
 * listens to real-time intent updates and behavioral events,
 * and handles proper cleanup on unmount.
 */
export function useContextPulse() {
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [events, setEvents] = useState<BehavioralEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the singleton SDK. If already initialized, it updates config.
    const sdk = ContextPulseSDK.init({
      siteId: 'demo-site',
      debug: false,
      collectionInterval: 500,
      onIntentUpdate: (result) => {
        setIntentResult(result);
      },
      onEvent: (event) => {
        setEvents((prev) => [event, ...prev].slice(0, 100));
      },
    });

    setIsInitialized(true);

    // Clean up on component unmount
    return () => {
      sdk.destroy();
    };
  }, []);

  const getVector = useCallback(() => {
    return intentResult?.vector ?? new Array(64).fill(0);
  }, [intentResult]);

  return {
    intentResult,
    events,
    isInitialized,
    getVector,
  };
}
