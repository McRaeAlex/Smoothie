<script>
  import { flip } from 'svelte/animate';
  import * as Tone from "tone";
  import { dndzone } from "svelte-dnd-action";
  import { TwoWayMap, arraysEqual } from "./util.js";

  export let level;
  export let midi;
  export let onSucess = () => {};

  const fruit = [
    "apple",
    "pear",
    "cherry",
    "strawberry",
    "banana",
    "watermelon",
    "kiwi",
    "orange",
    "mango",
    "lemon",
    "grape",
    "pineapple",
    "plum",
    "peach",
    "pomegranate",
    "papaya",
    "melon",
    "lime",
    "apricot",
  ].sort(() => Math.random() - 0.5);

  let trackmap = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 1
  }

  let selected_fruit = [];

  let track = midi.tracks[trackmap[level]]

    // get the set of unique notes
  const unique_tones = new Set();
  track.notes.forEach((note) => {
    unique_tones.add(note.name);
  });
  let unique_tones_arr = Array.from(unique_tones.values());

  // create a map from fruit to unique tones and add the fruit used to the selected_fruit list
  const fruit_to_tone_map = new TwoWayMap();
  unique_tones_arr.forEach((tone, i) => {
    const f = fruit[i];
    fruit_to_tone_map.set(f, tone);
  });


  /**
   * note_data is the metadata associated with a not at a index
   * ie. how hard and long is the 7th note played? At what time is it played?
   * this allows the user only to guess the tone
   */
  const note_data = track.notes.map((note) => {
    return {
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
    };
  });

  // get the correct order of the fruit
  const correct_tones = track.notes
    .sort((a, b) => a.time - b.time)
    .map((note, i) => {
      const fruit = fruit_to_tone_map.getRev(note.name);
      selected_fruit.push({ fruit, id: i});
      return note.name;
    });

  // randomize the selected fruit
  selected_fruit.sort(() => Math.random() - 0.5);


  const flipDurationMs = 200;

  // UI state
  let track_played = false;
  let attempts = 0;
  let found_notes = new Map(); // stores the name of the correct fruit once found

  const synth = new Tone.PolySynth(Tone.Synth).toDestination();

  function handleSort(e) {
    selected_fruit = e.detail.items;
  }

  function playFruitSound(f) {
    const tone = fruit_to_tone_map.get(f);
    synth.triggerAttackRelease(tone, "8n");
  }

  function playSelectedFruit() {
    const now = Tone.now() + 0.5;

    selected_fruit.forEach((fruit, i) => {
      const tone = fruit_to_tone_map.get(fruit.fruit);
      const curr_note_data = note_data[i];
      synth.triggerAttackRelease(
        tone,
        curr_note_data.duration,
        curr_note_data.time + now,
        curr_note_data.velocity
      );
    });
  }

  function handleSubmit() {
    // check if its corret!
    playTrack();
    playSelectedFruit();

    const selected_tones = selected_fruit.map((f) => fruit_to_tone_map.get(f.fruit));
    if (arraysEqual(selected_tones, correct_tones)) {
      onSucess();
    }
    selected_tones.forEach((tone, i) => {
      if (tone === correct_tones[i]) {
        found_notes = found_notes.set(i, selected_fruit[i].fruit);
      }
    });
    console.info(found_notes)
    track_played = false;
    attempts = attempts + 1;
  }

  function playTrack() {
    const now = Tone.now() + 0.5;
    midi.tracks.forEach((track) => {
      //create a synth for each track
      const synth = new Tone.Synth().toDestination();

      //schedule all of the events
      track.notes.forEach((note) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          note.time + now,
          note.velocity
        );
      });
    });
    track_played = true;
  }

  console.info('midi', midi)
  console.info('fruit to tone map', fruit_to_tone_map)
  console.info('correct tones', correct_tones)
  console.info("selected fruit", selected_fruit);
  console.info('note data', note_data)
</script>

<div>
  <div class="flex flex-row justify-between mb-2">
    <h2 class="md:text-xl">Level: {level}</h2>
    <h2 class="md:text-xl">Attempts: {attempts}</h2>
  </div>
  <selection
    use:dndzone={{ items: selected_fruit, flipDurationMs }}
    on:consider={handleSort}
    on:finalize={handleSort}
    class="flex flex-row space-between flex-wrap justify-between md:justify-center md:space-x-4 mb-4"
  >
    {#each selected_fruit as f, i (f.id)}
      <div
        on:click={() => playFruitSound(f.fruit)}
        class="shadow-md border p-2 text-center"
        class:bg-green-500={found_notes.get(i) == f.fruit}
        animate:flip="{{duration: flipDurationMs}}"
      >
        <span>{f.fruit}</span><br />
      </div>
    {/each}
  </selection>
  <div class="text-center">
    <button on:click={playSelectedFruit} class="btn">Play Fruit</button>
    <button on:click={handleSubmit} class="btn">Submit</button>
    <button
      on:click={playTrack}
      class="btn disabled:opacity-50 disabled:hover:bg-blue-500"
      disabled={track_played === true}
    >
      Play Track
    </button>
  </div>
</div>
