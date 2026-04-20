const fileUpload = document.getElementById('file-upload');
const trackSelect = document.getElementById('track-select');
const trackName = document.getElementById('track-name');
const trackArtist = document.getElementById('track-artist');
const trackFeatures = document.getElementById('track-features');

const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const seekBar = document.getElementById('seek-bar');
const currTimeEl = document.getElementById('curr-time');
const durTimeEl = document.getElementById('dur-time');

// New elements
const volSlider = document.getElementById('vol-slider');
const recordBtn = document.getElementById('record-btn');
const recordText = document.getElementById('record-text');
const recordIconWrap = document.getElementById('record-icon-wrap');

const muteBtn = document.getElementById('mute-btn');
const loopBtn = document.getElementById('loop-btn');
const speedBtn = document.getElementById('speed-btn');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

let audioPlayer = new Audio();
let tracks = [];
let currentTrackIndex = -1;


// Defaults
trackSelect.innerHTML = '<option value="" disabled selected>Select a track to play...</option>';


// File Upload Logic
fileUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/') || file.name.endsWith('.mp3')) {
            // Parser
            let name = file.name.replace(/\.[^/.]+$/, ""); // strip extension
            let artist = "Unknown Artist";
            let features = "None";

            if (name.includes(' - ')) {
                const parts = name.split(' - ');
                artist = parts[0].trim();
                name = parts.slice(1).join(' - ').trim();
            }

            tracks.push({
                name: name,
                artist: artist,
                features: features,
                url: URL.createObjectURL(file)
            });

            const option = document.createElement('option');
            option.value = tracks.length - 1;
            option.text = `${artist !== "Unknown Artist" ? artist + " - " : ""}${name}`;
            trackSelect.appendChild(option);
        }
    }

    // Auto-load (if no track was previously loaded)
    if (tracks.length > 0 && currentTrackIndex === -1) {
        trackSelect.value = "0";
        loadTrack(0);
    }
});

// Track selection from dropdown
trackSelect.addEventListener('change', (e) => {
    const index = parseInt(e.target.value, 10);
    if (isNaN(index)) return;
    loadTrack(index);
    playTrack();
});

// Track Loader
function loadTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    currentTrackIndex = index;
    const track = tracks[index];

    audioPlayer.src = track.url;
    audioPlayer.load();

    trackName.textContent = track.name;
    trackArtist.textContent = `Artist: ${track.artist}`;
    trackFeatures.textContent = `Features: ${track.features}`;

    trackSelect.value = index;

    // UI reset
    seekBar.value = 0;
    currTimeEl.textContent = "0:00";
    durTimeEl.textContent = "0:00";
    updateSeekBarGradient(0);

    // Handling conditional marquee
    trackName.classList.remove('scroll-text');

    setTimeout(() => {
        const containerWidth = trackName.parentElement.clientWidth;
        const textWidth = trackName.scrollWidth;

        if (textWidth > containerWidth) {
            const overflow = textWidth - containerWidth;
            trackName.style.setProperty('--scroll-amount', `-${overflow + 20}px`);

            // Duration adjustments based on length (for consistent scroll speed)
            const duration = Math.max(4, (overflow / 40) + 3);
            trackName.style.setProperty('--scroll-duration', `${duration}s`);

            trackName.classList.add('scroll-text');
        }
    }, 10);
}

// Track player
function playTrack() {
    if (currentTrackIndex === -1 && tracks.length > 0) {
        loadTrack(0);
    }
    if (currentTrackIndex === -1) return;

    audioPlayer.play();
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
}

// Track pause
function pauseTrack() {
    audioPlayer.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
}

// Play Button
playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
});

// Previous Track
prevBtn.addEventListener('click', () => {
    if (tracks.length === 0) return;
    let nextIndex = currentTrackIndex - 1;
    if (nextIndex < 0) nextIndex = tracks.length - 1;
    loadTrack(nextIndex);
    playTrack();
});

// Next Track
function playNext() {
    if (tracks.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) nextIndex = 0;
    loadTrack(nextIndex);
    playTrack();
}

nextBtn.addEventListener('click', playNext);
audioPlayer.addEventListener('ended', playNext);


// Audio Player Seek Bar
audioPlayer.addEventListener('loadedmetadata', () => {
    durTimeEl.textContent = formatTime(audioPlayer.duration);
    seekBar.max = audioPlayer.duration;
});

audioPlayer.addEventListener('timeupdate', () => {
    if (!isNaN(audioPlayer.duration)) {
        seekBar.value = audioPlayer.currentTime;
        currTimeEl.textContent = formatTime(audioPlayer.currentTime);

        // Update gradient visually
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        updateSeekBarGradient(percentage);
    }
});

seekBar.addEventListener('input', () => {
    if (isNaN(audioPlayer.duration)) return;
    audioPlayer.currentTime = seekBar.value;
    const percentage = (seekBar.value / audioPlayer.duration) * 100;
    updateSeekBarGradient(percentage);
});

function updateSeekBarGradient(percentage) {
    if (isNaN(percentage)) percentage = 0;
    // Gradient update so it looks like the blue color fills the slider track from left to right
    seekBar.style.background = `linear-gradient(to right, #5BB4FF 0%, #5BB4FF ${percentage}%, #E2E8F0 ${percentage}%, #E2E8F0 100%)`;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
