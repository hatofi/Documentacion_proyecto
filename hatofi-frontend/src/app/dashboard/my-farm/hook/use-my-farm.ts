"use client";

import { useEffect, useMemo, useState } from "react";
import { getFarms, type Farm } from "@/lib/farm-api";
import { createBatch, getBatchesByFarm, updateBatch, updateBatchStatus, type Batch, type BatchCreatePayload, type BatchStatus, type BatchUpdatePayload } from "@/lib/batch-api";

export function useMyFarm() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchStatus, setBatchStatus] = useState<BatchStatus | "ALL">("ALL");
  const [creatingBatch, setCreatingBatch] = useState(false);

  useEffect(() => {
    let active = true;
    getFarms()
      .then((loadedFarms) => {
        if (!active) return;
        setFarms(loadedFarms);
        setSelectedFarmId(loadedFarms[0]?.id ?? null);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No fue posible cargar tus fincas.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedFarmId === null) {
      return;
    }

    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setBatchesLoading(true);
        setBatchError("");
      }
    });
    getBatchesByFarm(selectedFarmId)
      .then((loadedBatches) => {
        if (active) setBatches(loadedBatches);
      })
      .catch((loadError) => {
        if (active) {
          setBatches([]);
          setBatchError(loadError instanceof Error ? loadError.message : "No fue posible cargar los lotes.");
        }
      })
      .finally(() => {
        if (active) setBatchesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedFarmId]);

  const selectedFarm = useMemo(
    () => farms.find((farm) => farm.id === selectedFarmId) ?? null,
    [farms, selectedFarmId],
  );

  const visibleBatches = useMemo(
    () => batchStatus === "ALL" ? batches : batches.filter((batch) => batch.status === batchStatus),
    [batchStatus, batches],
  );

  const handleCreateBatch = async (payload: BatchCreatePayload) => {
    setCreatingBatch(true);
    setBatchError("");
    try {
      const createdBatch = await createBatch(payload);
      setBatches((currentBatches) => [createdBatch, ...currentBatches]);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "No fue posible crear el lote.";
      setBatchError(message);
      throw createError;
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleUpdateBatch = async (batchId: number, payload: BatchUpdatePayload) => {
    const updatedBatch = await updateBatch(batchId, payload);
    setBatches((currentBatches) => currentBatches.map((batch) => batch.id === batchId ? updatedBatch : batch));
    return updatedBatch;
  };

  const handleUpdateBatchStatus = async (batchId: number, status: BatchStatus) => {
    const updatedBatch = await updateBatchStatus(batchId, status);
    setBatches((currentBatches) => currentBatches.map((batch) => batch.id === batchId ? updatedBatch : batch));
    return updatedBatch;
  };

  return {
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    loading,
    error,
    batches,
    visibleBatches,
    batchesLoading,
    batchError,
    batchStatus,
    setBatchStatus,
    creatingBatch,
    handleCreateBatch,
    handleUpdateBatch,
    handleUpdateBatchStatus,
  };
}
