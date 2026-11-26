import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, WS_URL } from '../config.js';
import { createFallbackSnapshot, stepFallback } from '../data/fallback.js';

export function useParkingStream() {
  const [snapshot, setSnapshot] = useState(createFallbackSnapshot);
  const [mode, setMode] = useState('connecting');
  const [lastEvent, setLastEvent] = useState(null);
  const disposedRef = useRef(false);

  useEffect(() => {
    disposedRef.current = false;
    let socket = null;
    let reconnectTimer = null;
    let demoTimer = null;

    const stopDemo = () => {
      if (demoTimer) clearInterval(demoTimer);
      demoTimer = null;
    };

    const startDemo = () => {
      if (disposedRef.current || demoTimer) return;
      setMode('demo');
      demoTimer = setInterval(() => {
        if (!disposedRef.current) setSnapshot((current) => stepFallback(current));
      }, 3200);
    };

    fetch(`${API_URL}/api/lot`)
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable');
        return response.json();
      })
      .then((data) => {
        if (!disposedRef.current) setSnapshot((current) => ({ ...current, ...data }));
      })
      .catch(startDemo);

    const connect = () => {
      try {
        socket = new WebSocket(WS_URL);
      } catch {
        startDemo();
        return;
      }

      socket.onopen = () => {
        stopDemo();
        if (!disposedRef.current) setMode('live');
      };

      socket.onmessage = (event) => {
        if (disposedRef.current) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.spots) setSnapshot((current) => ({ ...current, ...payload }));
          if (payload.activity?.[0]) setLastEvent(payload.activity[0]);
        } catch {
          // Ignore malformed frames.
        }
      };

      socket.onerror = () => socket?.close();

      socket.onclose = () => {
        if (disposedRef.current) return;
        startDemo();
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      disposedRef.current = true;
      clearTimeout(reconnectTimer);
      stopDemo();
      socket?.close();
    };
  }, []);

  const sendCommand = useCallback(async (type, id) => {
    if (mode !== 'live') {
      setSnapshot((current) => stepFallback(current, { type, id }));
      return { ok: true };
    }

    try {
      const response = await fetch(`${API_URL}/api/spots/${id}/${type}`, { method: 'POST' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Command failed');
      const updated = await response.json();
      setSnapshot((current) => ({
        ...current,
        spots: current.spots.map((spot) => (spot.id === id ? { ...spot, ...updated } : spot))
      }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [mode]);

  return { snapshot, mode, lastEvent, sendCommand };
}
