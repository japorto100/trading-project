import { useCallback } from "react";
import type { EditFormState, GeoEventResponse } from "@/features/geopolitical/shell/types";
import { getGeoCatalogEntry } from "@/lib/geopolitical/catalog";
import type { GeoConfidence, GeoCoordinate, GeoEvent, GeoSeverity } from "@/lib/geopolitical/types";

interface UseGeopoliticalMarkerMutationsParams {
	fetchAll: () => Promise<void>;
	eventsEditable: boolean;
	externalSourceLabel: string;
	selectedSymbol: string;
	activeRegionId: string;
	pendingPoint: GeoCoordinate | null;
	draftTitle: string;
	draftSummary: string;
	draftNote: string;
	draftSeverity: GeoSeverity;
	draftConfidence: GeoConfidence;
	selectedEvent: GeoEvent | null;
	editForm: EditFormState;
	resetCreateForm: () => void;
	setSelectedEventId: (next: string | null) => void;
	setBusy: (next: boolean) => void;
	setError: (next: string | null) => void;
}

export function useGeopoliticalMarkerMutations({
	fetchAll,
	eventsEditable,
	externalSourceLabel,
	selectedSymbol,
	activeRegionId,
	pendingPoint,
	draftTitle,
	draftSummary,
	draftNote,
	draftSeverity,
	draftConfidence,
	selectedEvent,
	editForm,
	resetCreateForm,
	setSelectedEventId,
	setBusy,
	setError,
}: UseGeopoliticalMarkerMutationsParams) {
	const createMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError(
				`${externalSourceLabel} mode is read-only. Switch source to Local to create/edit markers.`,
			);
			return;
		}
		if (!pendingPoint) {
			setError("Select a point on the map before creating a marker.");
			return;
		}
		if (draftTitle.trim().length < 3) {
			setError("Title must be at least 3 characters.");
			return;
		}

		const category = getGeoCatalogEntry(selectedSymbol)?.category;
		setBusy(true);
		setError(null);
		try {
			const response = await fetch("/api/geopolitical/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: draftTitle.trim(),
					symbol: selectedSymbol,
					category,
					severity: draftSeverity,
					confidence: draftConfidence,
					lat: pendingPoint.lat,
					lng: pendingPoint.lng,
					summary: draftSummary.trim(),
					analystNote: draftNote.trim(),
					status: "confirmed",
					countryCodes: [],
					regionIds: activeRegionId ? [activeRegionId] : [],
				}),
			});

			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(errorPayload.error ?? `Create failed (${response.status})`);
			}

			const payload = (await response.json()) as GeoEventResponse;
			setSelectedEventId(payload.event.id);
			await fetchAll();
			resetCreateForm();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not create marker");
		} finally {
			setBusy(false);
		}
	}, [
		activeRegionId,
		draftConfidence,
		draftNote,
		draftSeverity,
		draftSummary,
		draftTitle,
		eventsEditable,
		externalSourceLabel,
		fetchAll,
		pendingPoint,
		resetCreateForm,
		selectedSymbol,
		setBusy,
		setError,
		setSelectedEventId,
	]);

	const updateMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError(
				`${externalSourceLabel} mode is read-only. Switch source to Local to create/edit markers.`,
			);
			return;
		}
		if (!selectedEvent) {
			setError("No marker selected for update.");
			return;
		}
		if (editForm.title.trim().length < 3) {
			setError("Title must be at least 3 characters.");
			return;
		}

		setBusy(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: editForm.title.trim(),
						severity: editForm.severity,
						confidence: editForm.confidence,
						status: editForm.status,
						summary: editForm.summary.trim(),
						analystNote: editForm.analystNote.trim(),
					}),
				},
			);

			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(errorPayload.error ?? `Update failed (${response.status})`);
			}

			await fetchAll();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not update marker");
		} finally {
			setBusy(false);
		}
	}, [editForm, eventsEditable, externalSourceLabel, fetchAll, selectedEvent, setBusy, setError]);

	const deleteMarker = useCallback(async () => {
		if (!eventsEditable) {
			setError(
				`${externalSourceLabel} mode is read-only. Switch source to Local to create/edit markers.`,
			);
			return;
		}
		if (!selectedEvent) {
			setError("No marker selected for deletion.");
			return;
		}
		if (typeof window !== "undefined") {
			const confirmed = window.confirm(`Delete marker "${selectedEvent.title}"?`);
			if (!confirmed) {
				return;
			}
		}

		setBusy(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				const errorPayload = (await response.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(errorPayload.error ?? `Delete failed (${response.status})`);
			}

			setSelectedEventId(null);
			await fetchAll();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not delete marker");
		} finally {
			setBusy(false);
		}
	}, [
		eventsEditable,
		externalSourceLabel,
		fetchAll,
		selectedEvent,
		setBusy,
		setError,
		setSelectedEventId,
	]);

	const runHardIngest = useCallback(async () => {
		setBusy(true);
		await fetch("/api/geopolitical/candidates/ingest/hard", { method: "POST" });
		setBusy(false);
		await fetchAll();
	}, [fetchAll, setBusy]);

	const runSoftIngest = useCallback(async () => {
		setBusy(true);
		await fetch("/api/geopolitical/candidates/ingest/soft", { method: "POST" });
		setBusy(false);
		await fetchAll();
	}, [fetchAll, setBusy]);

	const handleCandidateAction = useCallback(
		async (candidateId: string, action: "accept" | "reject" | "snooze") => {
			setBusy(true);
			await fetch(`/api/geopolitical/candidates/${encodeURIComponent(candidateId)}/${action}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reviewNote: `${action} via queue` }),
			});
			setBusy(false);
			await fetchAll();
		},
		[fetchAll, setBusy],
	);

	const addSourceToSelectedEvent = useCallback(
		async (payload: {
			provider: string;
			url: string;
			title?: string;
			sourceTier?: "A" | "B" | "C";
		}) => {
			if (!eventsEditable) {
				setError(
					`${externalSourceLabel} mode is read-only. Switch source to Local to modify event sources.`,
				);
				return;
			}
			if (!selectedEvent) return;
			setBusy(true);
			await fetch(`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}/sources`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			setBusy(false);
			await fetchAll();
		},
		[eventsEditable, externalSourceLabel, fetchAll, selectedEvent, setBusy, setError],
	);

	const addAssetToSelectedEvent = useCallback(
		async (payload: {
			symbol: string;
			assetClass: "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
			relation: "beneficiary" | "exposed" | "hedge" | "uncertain";
			rationale?: string;
		}) => {
			if (!eventsEditable) {
				setError(
					`${externalSourceLabel} mode is read-only. Switch source to Local to modify event assets.`,
				);
				return;
			}
			if (!selectedEvent) return;
			setBusy(true);
			await fetch(`/api/geopolitical/events/${encodeURIComponent(selectedEvent.id)}/assets`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			setBusy(false);
			await fetchAll();
		},
		[eventsEditable, externalSourceLabel, fetchAll, selectedEvent, setBusy, setError],
	);

	return {
		createMarker,
		updateMarker,
		deleteMarker,
		runHardIngest,
		runSoftIngest,
		handleCandidateAction,
		addSourceToSelectedEvent,
		addAssetToSelectedEvent,
	};
}
