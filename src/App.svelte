<script>
  import Level from "./lib/Level.svelte";
  import { instructions } from "./lib/instructions";

  import { Midi } from "@tonejs/midi";
  import * as Tone from "tone";
  import { onMount } from "svelte";
  import snarkdown from "snarkdown";

  let start = false;
  let midi;
  let level = 1;
  let you_win = false;
  onMount(async () => {
    await loadLevel();
  });

  function onPlay() {
    Tone.context.resume();

    start = true;
  }

  async function loadLevel() {
    midi = undefined;
    midi = await Midi.fromUrl(`/midi/${level}.mid`);
  }

  function nextLevel() {
    level = level + 1;
    if (level > 6) {
        you_win = true;
        return;
    }
    loadLevel();
  }
</script>

<div class="p-4">
  <h1 class="text-center text-xl md:text-3xl underline mb-6">Smoothie!</h1>
  {#if !you_win}
  {#if !start}
    <button class="btn block mx-auto" on:click={onPlay}>Play?</button>
  {:else if !midi}
    <span>Loading...</span>
  {:else}
    <Level {midi} {level} onSucess={nextLevel} />
  {/if}
  {:else}
    <h2>YOU WIN!</h2>
  {/if}

  <article
    class="mt-8 relative w-full px-6 py-12 bg-white shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28"
  >
    <div class="mt-4 prose prose-slate dark:prose-invert mx-auto">
      {@html snarkdown(instructions)}
    </div>
  </article>
</div>
