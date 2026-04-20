const fileUpload = document.getElementById('file-upload');
const trackSelect = document.getElementById('track-select');
const trackName = document.getElementById('track-name');
const trackArtist = document.getElementById('track-artist');
const trackFeatures = document.getElementById('track-features');


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
