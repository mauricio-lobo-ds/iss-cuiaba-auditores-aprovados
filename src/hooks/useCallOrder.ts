import { useState, useEffect, useCallback } from 'react';
import { CallOrderState, Candidate, Specialty } from '../types';
import { CallOrderService } from '../services/CallOrderService';
import { CallOrderUseCase } from '../domain/usecases/CallOrderUseCase';
import { LocalStorageCallOrderRepository } from '../infrastructure/repositories/LocalStorageCallOrderRepository';

const callOrderRepository = new LocalStorageCallOrderRepository();
const callOrderUseCase = new CallOrderUseCase();
const callOrderService = new CallOrderService(callOrderRepository, callOrderUseCase);

export const useCallOrder = (specialty: Specialty, candidates: Candidate[]) => {
  const [callOrderState, setCallOrderState] = useState<CallOrderState>({
    positions: [],
    removedCandidates: [],
    sequence: [],
    loading: true
  });

  const [error, setError] = useState<string | null>(null);

  const initializeCallOrder = useCallback(async () => {
    if (candidates.length === 0) return;

    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const state = await callOrderService.initializeCallOrder(specialty, candidates);
      setCallOrderState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize call order');
    }
  }, [specialty, candidates]);

  const removeCandidate = useCallback(async (candidateId: string) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.removeCandidate(
        specialty,
        candidateId,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove candidate');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates]);

  const restoreCandidate = useCallback(async (candidateId: string) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.restoreCandidate(
        specialty,
        candidateId,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore candidate');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates]);

  const updatePositionType = useCallback(async (
    position: number,
    newType: 'AC' | 'PCD' | 'NI'
  ) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.updatePositionType(
        specialty,
        position,
        newType,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update position type');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates]);

  const resetCallOrder = useCallback(async () => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.resetCallOrder(specialty, candidates);
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset call order');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, candidates]);

  useEffect(() => {
    initializeCallOrder();
  }, [initializeCallOrder]);

  return {
    callOrderState,
    error,
    removeCandidate,
    restoreCandidate,
    updatePositionType,
    resetCallOrder,
    refetch: initializeCallOrder
  };
};