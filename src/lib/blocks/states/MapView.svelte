<script lang="ts">
	import { geoMercator, geoPath } from 'd3';
	import type { FeatureCollection, Geometry } from 'geojson';
	import { feature } from 'topojson-client';
	import { mapColor } from '#lib/scales';
	import { num, position } from '#lib/format';
	import { positions } from '#lib/ranking';
	import { store, toggleState } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { MapTopology, StateProps, StateRow } from '#lib/types';

	let { topology, rows }: { topology: MapTopology; rows: StateRow[] } = $props();

	// Projection computed at a fixed width; the SVG scales to the screen, so nothing needs to measure the window.
	const WIDTH = 1000;
	// topojson-client types its return value generically; the map is always a collection of states (see types.ts).
	const collection = $derived(
		feature(topology, topology.objects.states) as unknown as FeatureCollection<Geometry, StateProps>
	);
	const path = $derived(geoPath(geoMercator().fitWidth(WIDTH, collection)));
	const box = $derived(path.bounds(collection));
	const boxWidth = $derived(box[1][0] - box[0][0]);
	const boxHeight = $derived(box[1][1] - box[0][1]);
	// Width over height of the drawing: the box around the map keeps these proportions, so the DF pin lands on the right place.
	const ratio = $derived(boxWidth / boxHeight);

	const color = $derived(mapColor(store.colorblind));
	const byState = $derived(new Map(rows.map((row) => [row.code, row] as const)));
	const positionOf = $derived(positions(rows, store.measure));
	const shapes = $derived(
		collection.features.map((f) => ({ code: f.properties.state, name: f.properties.name, d: path(f) ?? '' }))
	);
	const dfName = $derived(shapes.find((shape) => shape.code === 'DF')?.name ?? 'DF');

	/** Pin for DF, which is too small to tap on a phone map. */
	const dfPin = $derived.by(() => {
		const df = collection.features.find((f) => f.properties.state === 'DF');
		if (!df) return null;
		const [x, y] = path.centroid(df);
		return {
			left: `${((x - box[0][0]) / boxWidth) * 100}%`,
			top: `${((y - box[0][1]) / boxHeight) * 100}%`
		};
	});

	function valueOf(code: string): number | undefined {
		return byState.get(code)?.[store.measure];
	}

	function shapeLabel(code: string, name: string): string {
		const value = valueOf(code);
		if (value === undefined) return name;
		return t('map.state', {
			name,
			measure: t(`measure.${store.measure}`),
			value: num(value),
			position: position(positionOf.get(code) ?? 0)
		});
	}

	function onKey(event: KeyboardEvent, code: string): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleState(code);
		}
	}

	const viewBox = $derived(`${box[0][0]} ${box[0][1]} ${boxWidth} ${boxHeight}`);
</script>

<div class="map" style:--ratio={ratio}>
	<svg {viewBox} role="group" aria-label={t('map.label', { measure: t(`measure.${store.measure}`), year: store.year })}>
		{#each shapes as shape (shape.code)}
			{@const value = valueOf(shape.code)}
			<path
				d={shape.d}
				role="button"
				tabindex="0"
				aria-label={shapeLabel(shape.code, shape.name)}
				aria-pressed={store.selectedCode === shape.code}
				class:selected={store.selectedCode === shape.code}
				style:fill={value === undefined ? 'var(--line)' : color(value)}
				onclick={() => toggleState(shape.code)}
				onkeydown={(event) => onKey(event, shape.code)}
			/>
		{/each}
	</svg>

	{#if dfPin}
		<button
			type="button"
			class="pin"
			class:selected={store.selectedCode === 'DF'}
			style:left={dfPin.left}
			style:top={dfPin.top}
			aria-label={shapeLabel('DF', dfName)}
			aria-pressed={store.selectedCode === 'DF'}
			onclick={() => toggleState('DF')}
		>
			DF
		</button>
	{/if}
</div>

<style>
	/* The box has the proportions of the drawing, so the percentages of the DF pin land on the right place. */
	.map {
		position: relative;
		width: 100%;
		aspect-ratio: var(--ratio);
	}

	svg {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	/* On a wide screen the map fits the height of its half, and the legend takes the space below it. */
	@media (min-width: 1024px) {
		.map {
			width: min(100%, calc((var(--visual-height) - 96px) * var(--ratio)));
			margin: 0 auto;
		}
	}

	path {
		stroke: var(--background);
		stroke-width: 0.8px;
		vector-effect: non-scaling-stroke;
		cursor: pointer;
		transition: fill 300ms ease;
	}

	path.selected {
		stroke: var(--text);
		stroke-width: 2.5px;
	}

	path:focus-visible {
		outline: none;
		stroke: var(--accent);
		stroke-width: 3px;
	}

	/* A 44 px touch area, with the small drawing in the middle. */
	.pin {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--text);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
	}

	.pin::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 14px;
		height: 14px;
		transform: translate(-50%, -50%);
		border: 1.5px solid var(--text);
		border-radius: 50%;
		background: var(--background);
	}

	.pin.selected::before {
		background: var(--text);
	}
</style>
