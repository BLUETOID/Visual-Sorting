// ========== ENHANCED AUDIO ENGINE ==========
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.soundType = 'triangle';
        this.enabled = true;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.15;
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    setVolume(value) {
        // value should be 0-100
        if (this.masterGain) {
            this.masterGain.gain.value = value / 100;
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Piano-like sound with harmonics
    playPiano(frequency, duration = 80) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;
        
        // Fundamental + harmonics for rich piano sound
        const harmonics = [1, 2, 3, 4, 5];
        const amplitudes = [1, 0.5, 0.25, 0.125, 0.0625];
        
        harmonics.forEach((harmonic, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.value = frequency * harmonic;
            osc.type = 'sine';
            
            const amp = amplitudes[i] * 0.1;
            gain.gain.setValueAtTime(amp, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
            
            osc.start(now);
            osc.stop(now + duration / 1000);
        });
    }

    // Synth sound with filter sweep
    playSynth(frequency, duration = 60) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 4, now);
        filter.frequency.exponentialRampToValueAtTime(frequency, now + duration / 2000);
        filter.Q.value = 5;
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    }

    // Bell/Chime sound
    playBell(frequency, duration = 150) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;
        
        // Bell has inharmonic partials
        const partials = [1, 2.4, 3, 4.5, 5.3];
        
        partials.forEach((partial, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.value = frequency * partial;
            osc.type = 'sine';
            
            const amp = 0.06 / (i + 1);
            gain.gain.setValueAtTime(amp, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
            
            osc.start(now);
            osc.stop(now + duration / 1000);
        });
    }

    // Marimba-like percussive sound
    playMarimba(frequency, duration = 100) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        filter.type = 'bandpass';
        filter.frequency.value = frequency;
        filter.Q.value = 2;
        
        // Sharp attack, quick decay
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    }

    // Basic waveform sounds
    playBasic(frequency, duration = 30, type = 'triangle') {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.frequency.value = frequency;
        osc.type = type;
        
        filter.type = 'lowpass';
        filter.frequency.value = Math.min(frequency * 3, 8000);
        filter.Q.value = 1;
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    }

    // Main play function that routes to appropriate sound
    play(frequency, duration = 40) {
        switch(this.soundType) {
            case 'piano':
                this.playPiano(frequency, duration * 2);
                break;
            case 'synth':
                this.playSynth(frequency, duration * 1.5);
                break;
            case 'bell':
                this.playBell(frequency, duration * 3);
                break;
            case 'marimba':
                this.playMarimba(frequency, duration * 2);
                break;
            case 'sine':
            case 'triangle':
            case 'square':
            case 'sawtooth':
                this.playBasic(frequency, duration, this.soundType);
                break;
            default:
                this.playBasic(frequency, duration, 'triangle');
        }
    }

    // Success chord
    playChord(frequencies, duration = 200) {
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playPiano(freq, duration), i * 30);
        });
    }
}

// ========== THEME MANAGER ==========
class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                barDefault: '#7dd3fc',
                barComparing: '#c084fc',
                barSwapping: '#4ade80',
                barSorted: '#4ade80'
            },
            midnight: {
                barDefault: '#6366f1',
                barComparing: '#f472b6',
                barSwapping: '#fbbf24',
                barSorted: '#34d399'
            },
            ocean: {
                barDefault: '#0ea5e9',
                barComparing: '#f97316',
                barSwapping: '#22d3ee',
                barSorted: '#10b981'
            },
            forest: {
                barDefault: '#22c55e',
                barComparing: '#facc15',
                barSwapping: '#f97316',
                barSorted: '#86efac'
            },
            sunset: {
                barDefault: '#f97316',
                barComparing: '#ec4899',
                barSwapping: '#fbbf24',
                barSorted: '#fb7185'
            },
            neon: {
                barDefault: '#e879f9',
                barComparing: '#22d3ee',
                barSwapping: '#a3e635',
                barSorted: '#4ade80'
            },
            retro: {
                barDefault: '#fbbf24',
                barComparing: '#ef4444',
                barSwapping: '#22c55e',
                barSorted: '#f59e0b'
            },
            light: {
                barDefault: '#3b82f6',
                barComparing: '#ec4899',
                barSwapping: '#22c55e',
                barSorted: '#10b981'
            }
        };
        this.currentTheme = 'dark';
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem('sortingVisualizerTheme', themeName);
        }
    }

    getColors() {
        return this.themes[this.currentTheme] || this.themes.dark;
    }

    loadSavedTheme() {
        const saved = localStorage.getItem('sortingVisualizerTheme');
        if (saved && this.themes[saved]) {
            this.setTheme(saved);
            return saved;
        }
        return 'dark';
    }
}

// ========== ALGORITHM INFORMATION DATABASE ==========
const ALGORITHM_INFO = {
    bubble: {
        name: 'Bubble Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Stable, In-place',
        description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.'
    },
    selection: {
        name: 'Selection Sort',
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Selection Sort divides the input into a sorted and an unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.'
    },
    insertion: {
        name: 'Insertion Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Stable, In-place',
        description: 'Insertion Sort builds the final sorted array one item at a time. It takes each element and inserts it into its correct position in the already sorted portion of the array.'
    },
    merge: {
        name: 'Merge Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)',
        properties: 'Stable, Out-of-place',
        description: 'Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.'
    },
    quick: {
        name: 'Quick Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
        space: 'O(log n)',
        properties: 'Unstable, In-place',
        description: 'Quick Sort picks a pivot element and partitions the array around it, placing smaller elements before and larger elements after the pivot. It then recursively sorts the partitions.'
    },
    heap: {
        name: 'Heap Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Heap Sort builds a max heap from the input data, then repeatedly extracts the maximum element and rebuilds the heap until the array is sorted.'
    },
    shell: {
        name: 'Shell Sort',
        best: 'O(n log n)',
        average: 'O(n^(4/3))',
        worst: 'O(n^(3/2))',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Shell Sort is a generalization of insertion sort that allows the exchange of items that are far apart. It starts with large gaps and progressively reduces them.'
    },
    comb: {
        name: 'Comb Sort',
        best: 'O(n log n)',
        average: 'O(n²/2^p)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Comb Sort improves on bubble sort by using gap sizes larger than 1. The gap starts large and shrinks by a factor until it becomes 1.'
    },
    cocktail: {
        name: 'Cocktail Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Stable, In-place',
        description: 'Cocktail Sort is a variation of bubble sort that sorts in both directions on each pass through the list, alternating between forward and backward passes.'
    },
    gnome: {
        name: 'Gnome Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Stable, In-place',
        description: 'Gnome Sort is similar to insertion sort except that moving an element to its proper place is accomplished by a series of swaps, like bubble sort.'
    },
    cycle: {
        name: 'Cycle Sort',
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Cycle Sort minimizes the number of memory writes by rotating the array elements. It is optimal in terms of the number of writes.'
    },
    pancake: {
        name: 'Pancake Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        properties: 'Unstable, In-place',
        description: 'Pancake Sort uses only flip operations - reversing a portion of the array from the beginning. It finds the maximum element and flips it to the correct position.'
    },
    tim: {
        name: 'Tim Sort',
        best: 'O(n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)',
        properties: 'Stable, Hybrid',
        description: 'Tim Sort is a hybrid stable sorting algorithm derived from merge sort and insertion sort. It is the default sorting algorithm in Python and Java.'
    },
    intro: {
        name: 'Intro Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(log n)',
        properties: 'Unstable, Hybrid',
        description: 'Intro Sort begins with quicksort and switches to heapsort when the recursion depth exceeds a level based on the number of elements being sorted.'
    },
    bitonic: {
        name: 'Bitonic Sort',
        best: 'O(log²n)',
        average: 'O(log²n)',
        worst: 'O(log²n)',
        space: 'O(log²n)',
        properties: 'Unstable, Parallel',
        description: 'Bitonic Sort is a parallel sorting algorithm that works by creating a bitonic sequence and then sorting it. It is efficient on parallel hardware.'
    },
    radix: {
        name: 'Radix Sort (LSD)',
        best: 'O(nk)',
        average: 'O(nk)',
        worst: 'O(nk)',
        space: 'O(n+k)',
        properties: 'Stable, Out-of-place',
        description: 'Radix Sort sorts numbers by processing individual digits. LSD (Least Significant Digit) radix sort processes digits from right to left.'
    }
};

const ALGORITHM_CODE = {
    bubble: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
}`,
    selection: `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
}`,
    insertion: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    merge: `function mergeSort(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
    quick: `function quickSort(arr, low, high) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
    heap: `function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
}`,
    shell: `function shellSort(arr) {
    const n = arr.length;
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
        for (let i = gap; i < n; i++) {
            let temp = arr[i], j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    radix: `function radixSort(arr) {
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10)
        countingSort(arr, exp);
}`,
    comb: `function combSort(arr) {
    let gap = arr.length;
    let shrink = 1.3;
    let sorted = false;
    while (!sorted) {
        gap = Math.floor(gap / shrink);
        if (gap <= 1) { gap = 1; sorted = true; }
        for (let i = 0; i + gap < arr.length; i++) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                sorted = false;
            }
        }
    }
}`,
    cocktail: `function cocktailSort(arr) {
    let swapped = true;
    let start = 0, end = arr.length - 1;
    while (swapped) {
        swapped = false;
        for (let i = start; i < end; i++) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swapped = true;
            }
        }
        if (!swapped) break;
        end--;
        swapped = false;
        for (let i = end - 1; i >= start; i--) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swapped = true;
            }
        }
        start++;
    }
}`,
    gnome: `function gnomeSort(arr) {
    let index = 0;
    while (index < arr.length) {
        if (index == 0 || arr[index] >= arr[index - 1])
            index++;
        else {
            [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
            index--;
        }
    }
}`,
    cycle: `function cycleSort(arr) {
    for (let cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
        let item = arr[cycleStart];
        let pos = cycleStart;
        for (let i = cycleStart + 1; i < arr.length; i++)
            if (arr[i] < item) pos++;
        if (pos == cycleStart) continue;
        while (item == arr[pos]) pos++;
        [item, arr[pos]] = [arr[pos], item];
        while (pos != cycleStart) {
            pos = cycleStart;
            for (let i = cycleStart + 1; i < arr.length; i++)
                if (arr[i] < item) pos++;
            while (item == arr[pos]) pos++;
            [item, arr[pos]] = [arr[pos], item];
        }
    }
}`,
    pancake: `function pancakeSort(arr) {
    for (let size = arr.length; size > 1; size--) {
        let maxIdx = findMax(arr, size);
        if (maxIdx != size - 1) {
            flip(arr, maxIdx);
            flip(arr, size - 1);
        }
    }
}`,
    tim: `function timSort(arr) {
    const RUN = 32;
    for (let i = 0; i < arr.length; i += RUN)
        insertionSort(arr, i, Math.min(i + RUN - 1, arr.length - 1));
    for (let size = RUN; size < arr.length; size = 2 * size) {
        for (let left = 0; left < arr.length; left += 2 * size) {
            const mid = left + size - 1;
            const right = Math.min(left + 2 * size - 1, arr.length - 1);
            if (mid < right)
                merge(arr, left, mid, right);
        }
    }
}`,
    intro: `function introSort(arr, begin, end, depthLimit) {
    if (end - begin > 1) {
        if (depthLimit == 0)
            heapSort(arr, begin, end);
        else {
            const p = partition(arr, begin, end);
            introSort(arr, begin, p, depthLimit - 1);
            introSort(arr, p + 1, end, depthLimit - 1);
        }
    }
}`,
    bitonic: `function bitonicSort(arr, low, cnt, dir) {
    if (cnt > 1) {
        const k = cnt / 2;
        bitonicSort(arr, low, k, 1);
        bitonicSort(arr, low + k, k, 0);
        bitonicMerge(arr, low, cnt, dir);
    }
}`
};

// ========== SORTING VISUALIZER ==========
class SortingVisualizer {
    constructor(canvasId = 'visualizer', statsPrefix = '', isCompareMode = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.array = [];
        this.arraySize = 300;
        this.speed = 98; // Higher = faster (inverted for user experience)
        this.isRunning = false;
        this.isPaused = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.currentAlgorithm = 'bubble';
        this.statsPrefix = statsPrefix;
        this.isCompareMode = isCompareMode;
        this.startTime = 0;
        
        // Step-by-step mode
        this.stepMode = false;
        this.stepQueue = [];
        this.stepResolve = null;
        
        // Shared audio engine and theme manager
        if (!window.audioEngine) {
            window.audioEngine = new AudioEngine();
        }
        if (!window.themeManager) {
            window.themeManager = new ThemeManager();
        }
        
        this.audio = window.audioEngine;
        this.themeManager = window.themeManager;
        
        this.initCanvas();
        if (!isCompareMode) {
            this.initControls();
        }
        this.generateArray();
        this.draw();
    }

    get colors() {
        return this.themeManager.getColors();
    }

    // Calculate actual delay from speed slider (0-100)
    // 0 = slowest (100ms), 100 = fastest (instant with batching)
    getDelay() {
        // Invert: high speed value = low delay
        // speed 0 = 100ms delay, speed 95-100 = 0ms (instant)
        if (this.speed >= 95) return 0;
        return Math.max(0, 100 - this.speed);
    }

    // Skip sleep calls at max speed for better performance
    shouldSkipSleep() {
        return this.speed >= 98;
    }

    initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    initControls() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const savedTheme = this.themeManager.loadSavedTheme();
            themeSelect.value = savedTheme;
            
            themeSelect.addEventListener('change', (e) => {
                this.themeManager.setTheme(e.target.value);
                this.updateArrayColors();
                this.draw();
            });
        }

        // Algorithm buttons
        document.querySelectorAll('.algo-btn:not(.compare-toggle):not(.benchmark-toggle):not(.study-toggle)').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isRunning) return;
                
                document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentAlgorithm = btn.dataset.algo;
                document.getElementById('algorithm').value = btn.dataset.algo;
            });
        });

        // Compare mode toggle
        const compareBtn = document.querySelector('.compare-toggle');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                
                const isActive = compareBtn.classList.contains('active');
                
                if (isActive) {
                    compareBtn.classList.remove('active');
                    document.getElementById('visualizer').style.display = 'block';
                    document.querySelector('.compare-container').style.display = 'none';
                    document.querySelector('.benchmark-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'none';
                    document.getElementById('singleModeBtn').classList.add('active');
                    document.getElementById('compareModeBtn').classList.remove('active');
                } else {
                    document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                    compareBtn.classList.add('active');
                    document.getElementById('visualizer').style.display = 'none';
                    document.querySelector('.compare-container').style.display = 'grid';
                    document.querySelector('.benchmark-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'none';
                    document.getElementById('compareModeBtn').classList.add('active');
                    document.getElementById('singleModeBtn').classList.remove('active');
                    
                    if (window.compareMode) {
                        window.compareMode.init();
                    }
                }
            });
        }
        
        // Benchmark mode toggle
        const benchmarkBtn = document.querySelector('.benchmark-toggle');
        if (benchmarkBtn) {
            benchmarkBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                
                const isActive = benchmarkBtn.classList.contains('active');
                
                if (isActive) {
                    benchmarkBtn.classList.remove('active');
                    document.getElementById('visualizer').style.display = 'block';
                    document.querySelector('.compare-container').style.display = 'none';
                    document.querySelector('.benchmark-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'none';
                } else {
                    document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                    benchmarkBtn.classList.add('active');
                    document.getElementById('visualizer').style.display = 'none';
                    document.querySelector('.compare-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'none';
                    document.querySelector('.benchmark-container').style.display = 'flex';
                    
                    if (window.benchmarkMode) {
                        window.benchmarkMode.init();
                    }
                }
            });
        }

        // Study mode toggle
        const studyBtn = document.querySelector('.study-toggle');
        if (studyBtn) {
            studyBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                
                const isActive = studyBtn.classList.contains('active');
                
                if (isActive) {
                    studyBtn.classList.remove('active');
                    document.getElementById('visualizer').style.display = 'block';
                    document.querySelector('.compare-container').style.display = 'none';
                    document.querySelector('.benchmark-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'none';
                } else {
                    document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                    studyBtn.classList.add('active');
                    document.getElementById('visualizer').style.display = 'none';
                    document.querySelector('.compare-container').style.display = 'none';
                    document.querySelector('.benchmark-container').style.display = 'none';
                    document.querySelector('.study-container').style.display = 'flex';
                    
                    if (window.studyMode) {
                        window.studyMode.init();
                    }
                }
            });
        }

        // Logo home button
        const logoHome = document.getElementById('logoHome');
        if (logoHome) {
            logoHome.addEventListener('click', () => {
                document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                document.getElementById('visualizer').style.display = 'block';
                document.querySelector('.compare-container').style.display = 'none';
                document.querySelector('.benchmark-container').style.display = 'none';
                document.querySelector('.study-container').style.display = 'none';
                if (window.studyMode) {
                    window.studyMode.pause();
                }
                this.stopSorting();
            });
        }

        // Sound toggle
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.addEventListener('click', () => {
            this.audio.enabled = !this.audio.enabled;
            soundBtn.classList.toggle('active', this.audio.enabled);
            soundBtn.classList.toggle('muted', !this.audio.enabled);
        });

        // Sound type select
        document.getElementById('soundType').addEventListener('change', (e) => {
            this.audio.soundType = e.target.value;
        });

        // Array size slider - REAL-TIME even during sorting
        const arraySizeSlider = document.getElementById('arraySize');
        const arraySizeValue = document.getElementById('arraySizeValue');
        arraySizeSlider.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value);
            this.arraySize = newSize;
            arraySizeValue.textContent = newSize + ' bars';
            
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            if (isCompareMode && window.compareMode) {
                // Update compare mode array sizes
                if (window.compareMode.visualizer1) {
                    window.compareMode.visualizer1.arraySize = newSize;
                    window.compareMode.visualizer1.resizeArray(newSize);
                    window.compareMode.visualizer1.draw();
                }
                if (window.compareMode.visualizer2) {
                    window.compareMode.visualizer2.arraySize = newSize;
                    window.compareMode.visualizer2.resizeArray(newSize);
                    window.compareMode.visualizer2.draw();
                }
            } else {
                // Real-time resize even during sorting
                this.resizeArray(newSize);
                this.draw();
            }
        });

        // Speed slider - REAL-TIME
        const speedSlider = document.getElementById('speed');
        const delayValue = document.getElementById('delayValue');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.updateSpeedLabel();
            
            // Sync speed with compare mode visualizers if they exist
            if (window.compareMode) {
                if (window.compareMode.visualizer1) window.compareMode.visualizer1.speed = this.speed;
                if (window.compareMode.visualizer2) window.compareMode.visualizer2.speed = this.speed;
            }
        });

        // Start button
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        startBtn.addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            if (isCompareMode) {
                window.compareMode.play();
            } else {
                this.play();
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
            }
        });
        
        // Stop button
        stopBtn.addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            if (isCompareMode) {
                window.compareMode.pause();
            } else {
                this.pause();
            }
            
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        });

        // Step button - Toggle step mode and execute step
        document.getElementById('stepBtn').addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            if (!this.isRunning && !isCompareMode) {
                // Start in step mode
                this.stepMode = true;
                this.play();
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
            } else if (this.stepMode && !isCompareMode) {
                // Execute next step
                this.executeStep();
            }
        });

        // Shuffle button
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            // Stop any running sorting first
            if (isCompareMode && window.compareMode) {
                window.compareMode.pause();
                window.compareMode.shuffle();
            } else {
                this.pause();
                this.shuffle();
            }
            
            // Reset button states
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        });

        // Preset buttons
        document.getElementById('reverseBtn').addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            // Stop any running sorting first
            if (isCompareMode && window.compareMode) {
                window.compareMode.pause();
                window.compareMode.setPreset('reverse');
            } else {
                this.pause();
                this.setPreset('reverse');
            }
            
            // Reset button states
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        });
        document.getElementById('valleyBtn').addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            // Stop any running sorting first
            if (isCompareMode && window.compareMode) {
                window.compareMode.pause();
                window.compareMode.setPreset('valley');
            } else {
                this.pause();
                this.setPreset('valley');
            }
            
            // Reset button states
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        });
        document.getElementById('mountainBtn').addEventListener('click', () => {
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            // Stop any running sorting first
            if (isCompareMode && window.compareMode) {
                window.compareMode.pause();
                window.compareMode.setPreset('mountain');
            } else {
                this.pause();
                this.setPreset('mountain');
            }
            
            // Reset button states
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        });

        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            this.audio.setVolume(parseInt(e.target.value));
        });

        // Custom array input
        const customArrayInput = document.getElementById('customArrayInput');
        const applyCustomArray = document.getElementById('applyCustomArray');
        
        applyCustomArray.addEventListener('click', () => {
            const input = customArrayInput.value.trim();
            if (!input) return;
            
            try {
                const values = input.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                if (values.length === 0) {
                    alert('Please enter valid comma-separated numbers');
                    return;
                }
                
                // Normalize values to 0-100 range
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                
                this.array = values.map(v => ({
                    value: ((v - min) / range) * 100,
                    color: this.colors.barDefault
                }));
                
                this.arraySize = this.array.length;
                document.getElementById('arraySize').value = this.arraySize;
                document.getElementById('arraySizeValue').textContent = this.arraySize + ' bars';
                
                this.draw();
                this.resetStats();
                customArrayInput.value = '';
            } catch (e) {
                alert('Invalid input format. Please use comma-separated numbers (e.g., 5,2,8,1,9)');
            }
        });
        
        // Enter key for custom array input
        customArrayInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyCustomArray.click();
            }
        });

        // Algorithm Info Button
        const algoInfoBtn = document.getElementById('algoInfoBtn');
        const algoInfoModal = document.getElementById('algoInfoModal');
        const modalClose = document.querySelector('.modal-close');
        
        algoInfoBtn.addEventListener('click', () => {
            this.showAlgorithmInfo();
        });
        
        modalClose.addEventListener('click', () => {
            algoInfoModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === algoInfoModal) {
                algoInfoModal.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            const compareBtn = document.querySelector('.compare-toggle');
            const isCompareMode = compareBtn && compareBtn.classList.contains('active');
            
            switch(e.key.toLowerCase()) {
                case ' ': // Space - Start/Stop
                    e.preventDefault();
                    if (this.isRunning || (isCompareMode && (window.compareMode.visualizer1?.isRunning || window.compareMode.visualizer2?.isRunning))) {
                        stopBtn.click();
                    } else {
                        startBtn.click();
                    }
                    break;
                case 'r': // R - Shuffle
                    e.preventDefault();
                    document.getElementById('shuffleBtn').click();
                    break;
                case 's': // S - Sound toggle
                    e.preventDefault();
                    document.getElementById('soundToggle').click();
                    break;
                case 'i': // I - Algorithm info
                    e.preventDefault();
                    algoInfoBtn.click();
                    break;
                case 'arrowright': // → - Step forward
                    e.preventDefault();
                    document.getElementById('stepBtn').click();
                    break;
                case 'escape': // Escape - Close modal
                    e.preventDefault();
                    algoInfoModal.style.display = 'none';
                    break;
            }
        });

        // Hidden controls compatibility
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        // Resize handler
        window.addEventListener('resize', () => {
            this.initCanvas();
            this.draw();
        });

        // Initialize values
        arraySizeSlider.value = this.arraySize;
        arraySizeValue.textContent = this.arraySize + ' bars';
        speedSlider.value = this.speed;
        this.updateSpeedLabel();
    }
    
    showAlgorithmInfo() {
        const algo = this.currentAlgorithm;
        const info = ALGORITHM_INFO[algo];
        
        if (!info) return;
        
        document.getElementById('algoInfoTitle').textContent = info.name;
        document.getElementById('infoBest').textContent = info.best;
        document.getElementById('infoAverage').textContent = info.average;
        document.getElementById('infoWorst').textContent = info.worst;
        document.getElementById('infoSpace').textContent = info.space;
        document.getElementById('infoProperties').textContent = info.properties;
        document.getElementById('infoDescription').textContent = info.description;
        
        document.getElementById('algoInfoModal').style.display = 'flex';
    }

    updateSpeedLabel() {
        const delayValue = document.getElementById('delayValue');
        if (!delayValue) return;
        
        const delay = this.getDelay();
        if (this.speed >= 95) {
            delayValue.textContent = 'MAX';
        } else if (delay <= 5) {
            delayValue.textContent = 'Fast';
        } else if (delay <= 20) {
            delayValue.textContent = 'Medium';
        } else if (delay <= 50) {
            delayValue.textContent = 'Slow';
        } else {
            delayValue.textContent = delay + ' ms';
        }
    }

    // Resize array while maintaining relative values
    resizeArray(newSize) {
        if (newSize === this.array.length) return;
        
        const oldArray = [...this.array];
        this.array = [];
        
        for (let i = 0; i < newSize; i++) {
            if (i < oldArray.length) {
                // Keep existing value, scaled
                this.array.push({
                    value: oldArray[i].value,
                    color: this.colors.barDefault
                });
            } else {
                // Add new random value
                this.array.push({
                    value: Math.random() * 100,
                    color: this.colors.barDefault
                });
            }
        }
        
        // If shrinking, just truncate
        if (newSize < oldArray.length) {
            this.array = this.array.slice(0, newSize);
        }
    }

    updateArrayColors() {
        const colors = this.colors;
        for (let i = 0; i < this.array.length; i++) {
            if (this.array[i].color !== colors.barSorted) {
                this.array[i].color = colors.barDefault;
            }
        }
    }

    generateArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: ((i + 1) / this.arraySize) * 100,
                color: this.colors.barDefault
            });
        }
        this.shuffleArray();
    }

    shuffleArray() {
        for (let i = this.array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        }
    }

    setPreset(type) {
        if (this.isRunning) return;
        
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            let value;
            switch(type) {
                case 'reverse':
                    value = ((this.arraySize - i) / this.arraySize) * 100;
                    break;
                case 'valley':
                    const mid = this.arraySize / 2;
                    value = (Math.abs(i - mid) / mid) * 100;
                    break;
                case 'mountain':
                    const center = this.arraySize / 2;
                    value = (1 - Math.abs(i - center) / center) * 100;
                    break;
                default:
                    value = ((i + 1) / this.arraySize) * 100;
            }
            this.array.push({
                value: value,
                color: this.colors.barDefault
            });
        }
        this.draw();
        this.resetStats();
    }

    setArrayFromSource(sourceArray) {
        this.array = sourceArray.map(item => ({...item}));
    }

    shuffle() {
        if (!this.isRunning) {
            this.generateArray();
            this.draw();
            this.resetStats();
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.textContent = 'Start';
                startBtn.classList.remove('running');
            }
        }
    }

    async play() {
        if (this.isRunning) return;
        
        this.audio.resume();
        
        this.isRunning = true;
        this.isPaused = false;
        this.resetStats();
        this.startTime = Date.now();
        
        // Reset colors
        this.array.forEach(item => item.color = this.colors.barDefault);
        
        const activeBtn = document.querySelector(`.algo-btn[data-algo="${this.currentAlgorithm}"]`);
        if (activeBtn) activeBtn.classList.add('sorting');

        switch(this.currentAlgorithm) {
            case 'bubble': await this.bubbleSort(); break;
            case 'selection': await this.selectionSort(); break;
            case 'insertion': await this.insertionSort(); break;
            case 'merge': await this.mergeSort(0, this.array.length - 1); break;
            case 'quick': await this.quickSort(0, this.array.length - 1); break;
            case 'heap': await this.heapSort(); break;
            case 'shell': await this.shellSort(); break;
            case 'comb': await this.combSort(); break;
            case 'cocktail': await this.cocktailSort(); break;
            case 'gnome': await this.gnomeSort(); break;
            case 'cycle': await this.cycleSort(); break;
            case 'pancake': await this.pancakeSort(); break;
            case 'tim': await this.timSort(); break;
            case 'intro': await this.introSort(0, this.array.length - 1, Math.floor(Math.log2(this.array.length)) * 2); break;
            case 'bitonic': await this.bitonicSort(0, this.array.length, 1); break;
            case 'radix': await this.radixSort(); break;
        }

        if (!this.isPaused) {
            await this.celebrateSort();
        }
        
        this.isRunning = false;
        document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('sorting'));
        
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        if (startBtn && stopBtn) {
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        }
    }

    pause() {
        this.isPaused = true;
        this.isRunning = false;
        document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('sorting'));
    }

    reset() {
        this.isPaused = false;
        this.isRunning = false;
        this.generateArray();
        this.draw();
        this.resetStats();
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.textContent = 'Start';
            startBtn.classList.remove('running');
        }
    }

    async sleep() {
        // Step mode: wait for user to click step button
        if (this.stepMode) {
            return new Promise(resolve => {
                this.stepResolve = resolve;
            });
        }
        
        if (this.isPaused) {
            while (this.isPaused && !this.isRunning) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        const delay = this.getDelay();
        if (delay === 0) {
            // At max speed, skip most sleep calls and batch render updates
            // Only yield every 20 operations to keep UI responsive
            if (this.shouldSkipSleep()) {
                this._sleepCounter = (this._sleepCounter || 0) + 1;
                if (this._sleepCounter % 20 === 0) {
                    return new Promise(resolve => requestAnimationFrame(resolve));
                }
                return Promise.resolve();
            }
            return new Promise(resolve => requestAnimationFrame(resolve));
        }
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    executeStep() {
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }

    draw(comparing = [], swapping = []) {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        const barWidth = width / this.array.length;
        const maxBarHeight = height - 10;
        const colors = this.colors;

        for (let i = 0; i < this.array.length; i++) {
            let color = this.array[i].color;
            
            if (comparing.includes(i)) {
                color = colors.barComparing;
            }
            if (swapping.includes(i)) {
                color = colors.barSwapping;
            }

            this.ctx.fillStyle = color;
            const barHeight = (this.array[i].value / 100) * maxBarHeight;
            
            this.ctx.fillRect(
                i * barWidth,
                height - barHeight,
                Math.max(barWidth - (this.array.length > 100 ? 0 : 1), 1),
                barHeight
            );
        }
    }

    async swap(i, j) {
        this.swaps++;
        this.updateSwapsDisplay();
        
        // Map value to musical note (pentatonic scale for pleasing sound)
        const avgValue = (this.array[i].value + this.array[j].value) / 2;
        const frequency = this.mapToFrequency(avgValue);
        this.audio.play(frequency, 30);
        
        const temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        
        this.draw([], [i, j]);
        await this.sleep();
    }

    // Map value (0-100) to a musical frequency (pentatonic scale)
    mapToFrequency(value) {
        // C pentatonic scale frequencies
        const scale = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880];
        const index = Math.floor((value / 100) * (scale.length - 1));
        return scale[Math.min(index, scale.length - 1)];
    }

    updateComparisons() {
        this.comparisons++;
        const compEl = document.getElementById('comparisons' + this.statsPrefix);
        if (compEl) compEl.textContent = this.comparisons;
    }

    updateSwapsDisplay() {
        const swapsEl = document.getElementById('swaps' + this.statsPrefix);
        if (swapsEl) swapsEl.textContent = this.swaps;
    }

    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        const compEl = document.getElementById('comparisons' + this.statsPrefix);
        const swapsEl = document.getElementById('swaps' + this.statsPrefix);
        if (compEl) compEl.textContent = '0';
        if (swapsEl) swapsEl.textContent = '0';
    }

    updateTime(milliseconds) {
        const timeEl = document.getElementById('time' + this.statsPrefix);
        if (!timeEl) return;
        timeEl.textContent = milliseconds + 'ms';
    }

    // ========== SORTING ALGORITHMS ==========

    async bubbleSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            if (this.isPaused) return;
            for (let j = 0; j < n - i - 1; j++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([j, j + 1], []);
                await this.sleep();
                
                if (this.array[j].value > this.array[j + 1].value) {
                    await this.swap(j, j + 1);
                }
            }
            this.array[n - i - 1].color = this.colors.barSorted;
        }
        this.array[0].color = this.colors.barSorted;
    }

    async selectionSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            if (this.isPaused) return;
            
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([minIdx, j], []);
                await this.sleep();
                
                if (this.array[j].value < this.array[minIdx].value) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                await this.swap(i, minIdx);
            }
            this.array[i].color = this.colors.barSorted;
        }
        this.array[n - 1].color = this.colors.barSorted;
    }

    async insertionSort() {
        const n = this.array.length;
        this.array[0].color = this.colors.barSorted;
        
        for (let i = 1; i < n; i++) {
            if (this.isPaused) return;
            
            let key = this.array[i].value;
            let j = i - 1;
            
            while (j >= 0 && this.array[j].value > key) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([j, j + 1], []);
                await this.sleep();
                
                this.array[j + 1].value = this.array[j].value;
                this.swaps++;
                this.updateSwapsDisplay();
                j--;
            }
            this.array[j + 1].value = key;
            
            // Play sound for insertion
            this.audio.play(this.mapToFrequency(key), 20);
            
            this.array[i].color = this.colors.barSorted;
            this.draw();
            await this.sleep();
        }
    }

    async mergeSort(left, right) {
        if (left >= right || this.isPaused) return;
        
        const mid = Math.floor((left + right) / 2);
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        if (this.isPaused) return;
        
        const leftArr = [];
        const rightArr = [];
        
        for (let i = left; i <= mid; i++) leftArr.push(this.array[i].value);
        for (let i = mid + 1; i <= right; i++) rightArr.push(this.array[i].value);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (this.isPaused) return;
            
            this.updateComparisons();
            this.draw([k], []);
            await this.sleep();
            
            if (leftArr[i] <= rightArr[j]) {
                this.array[k].value = leftArr[i];
                this.audio.play(this.mapToFrequency(leftArr[i]), 20);
                i++;
            } else {
                this.array[k].value = rightArr[j];
                this.audio.play(this.mapToFrequency(rightArr[j]), 20);
                j++;
            }
            this.swaps++;
            this.updateSwapsDisplay();
            k++;
        }
        
        while (i < leftArr.length) {
            if (this.isPaused) return;
            this.array[k].value = leftArr[i];
            this.audio.play(this.mapToFrequency(leftArr[i]), 15);
            this.swaps++;
            this.updateSwapsDisplay();
            i++; k++;
            this.draw([k], []);
            await this.sleep();
        }
        
        while (j < rightArr.length) {
            if (this.isPaused) return;
            this.array[k].value = rightArr[j];
            this.audio.play(this.mapToFrequency(rightArr[j]), 15);
            this.swaps++;
            this.updateSwapsDisplay();
            j++; k++;
            this.draw([k], []);
            await this.sleep();
        }
        
        for (let x = left; x <= right; x++) {
            this.array[x].color = this.colors.barSorted;
        }
    }

    async quickSort(low, high) {
        if (low < high && !this.isPaused) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high].value;
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (this.isPaused) return i + 1;
            
            this.updateComparisons();
            this.draw([j, high], []);
            await this.sleep();
            
            if (this.array[j].value < pivot) {
                i++;
                await this.swap(i, j);
            }
        }
        await this.swap(i + 1, high);
        this.array[i + 1].color = this.colors.barSorted;
        return i + 1;
    }

    async heapSort() {
        const n = this.array.length;
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            if (this.isPaused) return;
            await this.heapify(n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            if (this.isPaused) return;
            await this.swap(0, i);
            this.array[i].color = this.colors.barSorted;
            await this.heapify(i, 0);
        }
        this.array[0].color = this.colors.barSorted;
    }

    async heapify(n, i) {
        if (this.isPaused) return;
        
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.updateComparisons();
            this.draw([i, left], []);
            await this.sleep();
            if (this.array[left].value > this.array[largest].value) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.updateComparisons();
            this.draw([i, right], []);
            await this.sleep();
            if (this.array[right].value > this.array[largest].value) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
    }

    async shellSort() {
        const n = this.array.length;
        let gap = Math.floor(n / 2);
        
        while (gap > 0) {
            if (this.isPaused) return;
            
            for (let i = gap; i < n; i++) {
                if (this.isPaused) return;
                
                let temp = this.array[i].value;
                let j = i;
                
                while (j >= gap && this.array[j - gap].value > temp) {
                    if (this.isPaused) return;
                    
                    this.updateComparisons();
                    this.draw([j, j - gap], []);
                    await this.sleep();
                    
                    this.array[j].value = this.array[j - gap].value;
                    this.audio.play(this.mapToFrequency(this.array[j].value), 15);
                    this.swaps++;
                    this.updateSwapsDisplay();
                    j -= gap;
                }
                this.array[j].value = temp;
            }
            gap = Math.floor(gap / 2);
        }
        
        for (let i = 0; i < n; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async combSort() {
        const n = this.array.length;
        let gap = n;
        const shrink = 1.3;
        let sorted = false;
        
        while (!sorted) {
            if (this.isPaused) return;
            
            gap = Math.floor(gap / shrink);
            if (gap <= 1) {
                gap = 1;
                sorted = true;
            }
            
            for (let i = 0; i + gap < n; i++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([i, i + gap], []);
                await this.sleep();
                
                if (this.array[i].value > this.array[i + gap].value) {
                    await this.swap(i, i + gap);
                    sorted = false;
                }
            }
        }
        
        for (let i = 0; i < n; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async cocktailSort() {
        let start = 0;
        let end = this.array.length - 1;
        let swapped = true;
        
        while (swapped) {
            if (this.isPaused) return;
            swapped = false;
            
            for (let i = start; i < end; i++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([i, i + 1], []);
                await this.sleep();
                
                if (this.array[i].value > this.array[i + 1].value) {
                    await this.swap(i, i + 1);
                    swapped = true;
                }
            }
            
            if (!swapped) break;
            swapped = false;
            end--;
            this.array[end + 1].color = this.colors.barSorted;
            
            for (let i = end - 1; i >= start; i--) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([i, i + 1], []);
                await this.sleep();
                
                if (this.array[i].value > this.array[i + 1].value) {
                    await this.swap(i, i + 1);
                    swapped = true;
                }
            }
            this.array[start].color = this.colors.barSorted;
            start++;
        }
        
        for (let i = 0; i < this.array.length; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async gnomeSort() {
        let index = 0;
        const n = this.array.length;
        
        while (index < n) {
            if (this.isPaused) return;
            
            if (index === 0) index++;
            
            this.updateComparisons();
            this.draw([index, index - 1], []);
            await this.sleep();
            
            if (this.array[index].value >= this.array[index - 1].value) {
                index++;
            } else {
                await this.swap(index, index - 1);
                index--;
            }
        }
        
        for (let i = 0; i < n; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async cycleSort() {
        const n = this.array.length;
        
        for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
            if (this.isPaused) return;
            
            let item = this.array[cycleStart].value;
            let pos = cycleStart;
            
            for (let i = cycleStart + 1; i < n; i++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([cycleStart, i], []);
                await this.sleep();
                
                if (this.array[i].value < item) pos++;
            }
            
            if (pos === cycleStart) continue;
            
            while (item === this.array[pos].value) pos++;
            
            if (pos !== cycleStart) {
                let temp = item;
                item = this.array[pos].value;
                this.array[pos].value = temp;
                this.audio.play(this.mapToFrequency(temp), 20);
                this.swaps++;
                this.updateSwapsDisplay();
                this.draw([], [pos]);
                await this.sleep();
            }
            
            while (pos !== cycleStart) {
                if (this.isPaused) return;
                
                pos = cycleStart;
                
                for (let i = cycleStart + 1; i < n; i++) {
                    if (this.isPaused) return;
                    this.updateComparisons();
                    if (this.array[i].value < item) pos++;
                }
                
                while (item === this.array[pos].value) pos++;
                
                if (item !== this.array[pos].value) {
                    let temp = item;
                    item = this.array[pos].value;
                    this.array[pos].value = temp;
                    this.audio.play(this.mapToFrequency(temp), 20);
                    this.swaps++;
                    this.updateSwapsDisplay();
                    this.draw([], [pos]);
                    await this.sleep();
                }
            }
            this.array[cycleStart].color = this.colors.barSorted;
        }
        this.array[n - 1].color = this.colors.barSorted;
    }

    async pancakeSort() {
        const n = this.array.length;
        
        for (let currSize = n; currSize > 1; currSize--) {
            if (this.isPaused) return;
            
            let maxIdx = 0;
            for (let i = 0; i < currSize; i++) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([i, maxIdx], []);
                await this.sleep();
                
                if (this.array[i].value > this.array[maxIdx].value) {
                    maxIdx = i;
                }
            }
            
            if (maxIdx !== currSize - 1) {
                await this.flip(maxIdx);
                await this.flip(currSize - 1);
            }
            this.array[currSize - 1].color = this.colors.barSorted;
        }
        this.array[0].color = this.colors.barSorted;
    }

    async flip(k) {
        let start = 0;
        while (start < k) {
            if (this.isPaused) return;
            await this.swap(start, k);
            start++;
            k--;
        }
    }

    async timSort() {
        const RUN = 32;
        const n = this.array.length;
        
        for (let start = 0; start < n; start += RUN) {
            if (this.isPaused) return;
            const end = Math.min(start + RUN - 1, n - 1);
            await this.insertionSortRange(start, end);
        }
        
        let size = RUN;
        while (size < n) {
            if (this.isPaused) return;
            
            for (let start = 0; start < n; start += size * 2) {
                if (this.isPaused) return;
                
                const mid = start + size - 1;
                const end = Math.min(start + size * 2 - 1, n - 1);
                
                if (mid < end) {
                    await this.merge(start, mid, end);
                }
            }
            size *= 2;
        }
        
        for (let i = 0; i < n; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async insertionSortRange(left, right) {
        for (let i = left + 1; i <= right; i++) {
            if (this.isPaused) return;
            
            let key = this.array[i].value;
            let j = i - 1;
            
            while (j >= left && this.array[j].value > key) {
                if (this.isPaused) return;
                
                this.updateComparisons();
                this.draw([j, j + 1], []);
                await this.sleep();
                
                this.array[j + 1].value = this.array[j].value;
                this.swaps++;
                this.updateSwapsDisplay();
                j--;
            }
            this.array[j + 1].value = key;
        }
    }

    async introSort(low, high, depthLimit) {
        if (this.isPaused) return;
        
        const n = high - low + 1;
        
        if (n <= 1) return;
        
        if (n <= 16) {
            await this.insertionSortRange(low, high);
            return;
        }
        
        if (depthLimit === 0) {
            await this.heapSortRange(low, high);
            return;
        }
        
        const pivot = await this.partition(low, high);
        await this.introSort(low, pivot - 1, depthLimit - 1);
        await this.introSort(pivot + 1, high, depthLimit - 1);
    }

    async heapSortRange(low, high) {
        const n = high - low + 1;
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            if (this.isPaused) return;
            await this.heapifyRange(low, n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            if (this.isPaused) return;
            await this.swap(low, low + i);
            await this.heapifyRange(low, i, 0);
        }
    }

    async heapifyRange(low, n, i) {
        if (this.isPaused) return;
        
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.updateComparisons();
            if (this.array[low + left].value > this.array[low + largest].value) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.updateComparisons();
            if (this.array[low + right].value > this.array[low + largest].value) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            await this.swap(low + i, low + largest);
            await this.heapifyRange(low, n, largest);
        }
    }

    async bitonicSort(low, cnt, dir) {
        if (this.isPaused || cnt <= 1) return;
        
        const k = Math.floor(cnt / 2);
        await this.bitonicSort(low, k, 1);
        await this.bitonicSort(low + k, k, 0);
        await this.bitonicMerge(low, cnt, dir);
    }

    async bitonicMerge(low, cnt, dir) {
        if (this.isPaused || cnt <= 1) return;
        
        const k = Math.floor(cnt / 2);
        
        for (let i = low; i < low + k && i + k < this.array.length; i++) {
            if (this.isPaused) return;
            
            this.updateComparisons();
            this.draw([i, i + k], []);
            await this.sleep();
            
            if ((this.array[i].value > this.array[i + k].value && dir === 1) ||
                (this.array[i].value < this.array[i + k].value && dir === 0)) {
                await this.swap(i, i + k);
            }
        }
        
        await this.bitonicMerge(low, k, dir);
        await this.bitonicMerge(low + k, k, dir);
    }

    async radixSort() {
        const max = Math.max(...this.array.map(item => item.value));
        
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            if (this.isPaused) return;
            await this.countingSortByDigit(exp);
        }
        
        for (let i = 0; i < this.array.length; i++) {
            this.array[i].color = this.colors.barSorted;
        }
    }

    async countingSortByDigit(exp) {
        const n = this.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        
        for (let i = 0; i < n; i++) {
            if (this.isPaused) return;
            const digit = Math.floor(this.array[i].value / exp) % 10;
            count[digit]++;
            this.updateComparisons();
            this.draw([i], []);
            await this.sleep();
        }
        
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = n - 1; i >= 0; i--) {
            if (this.isPaused) return;
            const digit = Math.floor(this.array[i].value / exp) % 10;
            output[count[digit] - 1] = this.array[i].value;
            count[digit]--;
            this.draw([i], []);
            await this.sleep();
        }
        
        for (let i = 0; i < n; i++) {
            if (this.isPaused) return;
            this.array[i].value = output[i];
            this.audio.play(this.mapToFrequency(output[i]), 15);
            this.swaps++;
            this.updateSwapsDisplay();
            this.draw([], [i]);
            await this.sleep();
        }
    }

    async celebrateSort() {
        // Quick sweep animation with ascending notes
        const step = Math.max(1, Math.floor(this.array.length / 50));
        for (let i = 0; i < this.array.length; i += step) {
            if (this.isPaused) return;
            this.array[i].color = this.colors.barSorted;
            this.audio.play(this.mapToFrequency(this.array[i].value), 20);
            this.draw();
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Ensure all are green
        for (let i = 0; i < this.array.length; i++) {
            this.array[i].color = this.colors.barSorted;
        }
        this.draw();
        
        // Final chord
        this.audio.playChord([523.25, 659.25, 783.99], 300);
    }
}

// ========== BENCHMARK MODE ==========
class BenchmarkMode {
    constructor() {
        this.visualizers = [];
        this.results = [];
        this.isRunning = false;
        this.algorithms = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 
                          'shell', 'comb', 'cocktail', 'gnome', 'cycle', 'pancake', 
                          'tim', 'intro', 'bitonic', 'radix'];
    }

    init() {
        console.log('BenchmarkMode.init() called');
        const grid = document.getElementById('benchmarkGrid');
        grid.innerHTML = '';
        this.visualizers = [];
        this.results = [];
        
        // Create mini visualizers for each algorithm
        this.algorithms.forEach((algo, index) => {
            const panel = document.createElement('div');
            panel.className = 'benchmark-panel';
            panel.innerHTML = `
                <div class="benchmark-panel-header">
                    <span class="algo-name">${ALGORITHM_INFO[algo].name}</span>
                    <div class="benchmark-status" id="status-${algo}">Waiting</div>
                </div>
                <canvas id="benchmark-${algo}" class="benchmark-canvas"></canvas>
                <div class="benchmark-stats">
                    <span>Time: <strong id="time-${algo}">-</strong></span>
                    <span>Comp: <strong id="comp-${algo}">-</strong></span>
                </div>
            `;
            grid.appendChild(panel);
        });
        
        console.log('Canvas elements created, waiting for DOM render...');
        
        // Wait for DOM to update, then create visualizers
        setTimeout(() => {
            console.log('Creating visualizers...');
            this.algorithms.forEach((algo, index) => {
                const canvasEl = document.getElementById(`benchmark-${algo}`);
                if (!canvasEl) {
                    console.error(`Canvas not found: benchmark-${algo}`);
                    return;
                }
                
                // Create visualizer for this algorithm
                try {
                    const visualizer = new SortingVisualizer(`benchmark-${algo}`, '', true);
                    visualizer.currentAlgorithm = algo;
                    visualizer.arraySize = 50; // Smaller for performance
                    visualizer.speed = 100; // Maximum speed
                    this.visualizers.push(visualizer);
                    console.log(`Visualizer created for ${algo}`);
                } catch (e) {
                    console.error(`Error creating visualizer for ${algo}:`, e);
                }
            });
            
            console.log(`Total visualizers created: ${this.visualizers.length}`);
            
            // Generate shared array
            this.generateArray();
        }, 50);
    }

    generateArray(caseType = 'random') {
        const arraySize = 50;
        const colors = window.themeManager.getColors();
        const sharedArray = [];
        
        for (let i = 0; i < arraySize; i++) {
            let value;
            switch(caseType) {
                case 'sorted':
                    value = ((i + 1) / arraySize) * 100;
                    break;
                case 'reverse':
                    value = ((arraySize - i) / arraySize) * 100;
                    break;
                case 'nearly':
                    value = ((i + 1) / arraySize) * 100;
                    // Add small random perturbations
                    if (Math.random() > 0.9) {
                        value = Math.random() * 100;
                    }
                    break;
                default: // random
                    value = ((i + 1) / arraySize) * 100;
            }
            sharedArray.push({ value, color: colors.barDefault });
        }
        
        // Shuffle for random case
        if (caseType === 'random') {
            for (let i = sharedArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sharedArray[i], sharedArray[j]] = [sharedArray[j], sharedArray[i]];
            }
        }
        
        // Set same array to all visualizers
        this.visualizers.forEach(visualizer => {
            visualizer.setArrayFromSource(sharedArray);
            visualizer.draw();
        });
    }

    async play() {
        if (this.isRunning) return;
        
        // Check if visualizers are initialized
        if (this.visualizers.length === 0) {
            console.log('Visualizers not initialized yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (this.visualizers.length === 0) {
            console.error('Benchmark visualizers failed to initialize');
            return;
        }
        
        this.isRunning = true;
        this.results = [];
        
        const startBtn = document.getElementById('benchmarkStartBtn');
        const stopBtn = document.getElementById('benchmarkStopBtn');
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        
        // Reset all status
        this.algorithms.forEach(algo => {
            document.getElementById(`status-${algo}`).textContent = 'Waiting';
            document.getElementById(`status-${algo}`).className = 'benchmark-status waiting';
        });
        
        // Run all algorithms in parallel
        const promises = this.visualizers.map(async (visualizer, index) => {
            const algo = this.algorithms[index];
            const statusEl = document.getElementById(`status-${algo}`);
            const timeEl = document.getElementById(`time-${algo}`);
            const compEl = document.getElementById(`comp-${algo}`);
            
            statusEl.textContent = 'Running';
            statusEl.className = 'benchmark-status running';
            
            const startTime = Date.now();
            visualizer.resetStats();
            
            try {
                await visualizer.play();
                
                const endTime = Date.now();
                const elapsed = endTime - startTime;
                
                if (this.isRunning) {
                    statusEl.textContent = 'Done';
                    statusEl.className = 'benchmark-status done';
                    
                    timeEl.textContent = elapsed + 'ms';
                    compEl.textContent = visualizer.comparisons;
                    
                    this.results.push({
                        algorithm: algo,
                        name: ALGORITHM_INFO[algo].name,
                        time: elapsed,
                        comparisons: visualizer.comparisons
                    });
                }
            } catch (e) {
                statusEl.textContent = 'Error';
                statusEl.className = 'benchmark-status error';
            }
        });
        
        await Promise.all(promises);
        
        if (this.isRunning) {
            this.updateLeaderboard();
        }
        
        this.isRunning = false;
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    }

    stop() {
        this.isRunning = false;
        this.visualizers.forEach(v => v.pause());
    }

    updateLeaderboard(sortBy = 'time') {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (this.results.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-empty">Run benchmark to see results</div>';
            return;
        }
        
        // Sort results
        const sorted = [...this.results].sort((a, b) => a[sortBy] - b[sortBy]);
        
        // Generate leaderboard HTML
        let html = '';
        sorted.forEach((result, index) => {
            const rank = index + 1;
            html += `
                <div class="leaderboard-item rank-${rank}">
                    <span class="rank">${rank}</span>
                    <span class="algo-name">${result.name}</span>
                    <div class="stats">
                        <span>Time: ${result.time}ms</span>
                        <span>Comp: ${result.comparisons}</span>
                    </div>
                </div>
            `;
        });
        
        leaderboardList.innerHTML = html;
    }
}

// ========== STUDY MODE ==========
class StudyMode {
    constructor() {
        this.currentAlgo = 'bubble';
        this.isPlaying = false;
        this.array = [];
        this.arraySize = 10;
        this.speed = 500;
        this.isPaused = false;
        this.stepMode = false;
        this.waitingForStep = false;
    }

    init() {
        this.generateArray();
        this.loadAlgorithm(this.currentAlgo);
        this.setupControls();
        this.renderArray();
    }

    generateArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: Math.floor(Math.random() * 99) + 1,
                state: 'default'
            });
        }
    }

    renderArray() {
        const container = document.getElementById('studyArrayContainer');
        if (!container) return;
        
        container.innerHTML = '';
        this.array.forEach((item, index) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = item.value;
            element.id = `study-elem-${index}`;
            
            if (item.state === 'comparing') element.classList.add('comparing');
            if (item.state === 'swapping') element.classList.add('swapping');
            if (item.state === 'sorted') element.classList.add('sorted');
            
            container.appendChild(element);
        });
    }

    async sleep(ms) {
        // If in step mode, wait for user to click step button
        if (this.stepMode) {
            this.waitingForStep = true;
            await new Promise(resolve => {
                this.stepResolve = resolve;
            });
            this.waitingForStep = false;
            return;
        }
        
        // If paused, wait until unpaused
        if (this.isPaused) {
            await new Promise(resolve => {
                const checkPause = setInterval(() => {
                    if (!this.isPaused) {
                        clearInterval(checkPause);
                        resolve();
                    }
                }, 100);
            });
        }
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    executeStep() {
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }

    updateStep(text) {
        document.getElementById('studyStepText').textContent = text;
    }

    setupControls() {
        // Algorithm selection buttons
        document.querySelectorAll('.study-algo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.study-algo-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentAlgo = btn.dataset.algo;
                this.isPaused = true;
                this.isPlaying = false;
                this.stepMode = false;
                if (this.stepResolve) {
                    this.stepResolve();
                    this.stepResolve = null;
                }
                this.loadAlgorithm(this.currentAlgo);
                this.reset();
            });
        });

        // Play button
        const playBtn = document.getElementById('studyPlayBtn');
        const pauseBtn = document.getElementById('studyPauseBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.stepMode = false;
                this.play();
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
            });
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pause();
                pauseBtn.style.display = 'none';
                playBtn.style.display = 'inline-block';
            });
        }

        // Step button
        const stepBtn = document.getElementById('studyStepBtn');
        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                if (!this.isPlaying) {
                    // Start in step mode
                    this.stepMode = true;
                    this.play();
                    playBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                } else if (this.waitingForStep) {
                    // Execute next step
                    this.executeStep();
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('studyResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Speed slider
        const speedSlider = document.getElementById('studySpeed');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                // Lower slider value = slower (higher delay)
                // Higher slider value = faster (lower delay)
                this.speed = 1000 - (parseInt(e.target.value) * 9);
            });
        }

        // Tab switching
        document.querySelectorAll('.study-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.study-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.study-tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
            });
        });
    }

    loadAlgorithm(algo) {
        const info = ALGORITHM_INFO[algo];
        if (!info) return;

        // Update title
        document.getElementById('studyAlgoTitle').textContent = info.name;

        // Update overview tab
        document.getElementById('studyDescription').textContent = info.description;
        const propsList = document.getElementById('studyProperties');
        propsList.innerHTML = `
            <li><strong>Time Complexity (Best):</strong> ${info.best}</li>
            <li><strong>Time Complexity (Average):</strong> ${info.average}</li>
            <li><strong>Time Complexity (Worst):</strong> ${info.worst}</li>
            <li><strong>Space Complexity:</strong> ${info.space}</li>
            <li><strong>Properties:</strong> ${info.properties}</li>
        `;

        // Update complexity tab
        document.getElementById('studyBest').textContent = info.best;
        document.getElementById('studyAverage').textContent = info.average;
        document.getElementById('studyWorst').textContent = info.worst;
        document.getElementById('studySpace').textContent = info.space;

        // Update code tab
        const code = ALGORITHM_CODE[algo] || '// Code example coming soon';
        document.getElementById('studyCode').textContent = code;

        // Reset explanation
        document.getElementById('studyStepText').textContent = 'Click Play or Step to begin learning';

        // Set algorithm for visualizer
        if (this.visualizer) {
            this.visualizer.currentAlgorithm = algo;
        }
    }

    async play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.isPaused = false;
        
        this.updateStep(`Starting ${ALGORITHM_INFO[this.currentAlgo].name}...`);
        
        // Execute the sorting algorithm
        await this.executeSort();
        
        // Mark all as sorted
        this.array.forEach(item => item.state = 'sorted');
        this.renderArray();
        
        this.updateStep('Sorting complete!');
        this.isPlaying = false;
        
        document.getElementById('studyPlayBtn').style.display = 'inline-block';
        document.getElementById('studyPauseBtn').style.display = 'none';
    }

    pause() {
        this.isPaused = true;
        this.isPlaying = false;
        this.stepMode = false;
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }

    reset() {
        this.isPaused = true;
        this.isPlaying = false;
        this.stepMode = false;
        this.waitingForStep = false;
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
        this.generateArray();
        this.renderArray();
        this.updateStep('Click Play or Step to begin');
        document.getElementById('studyPlayBtn').style.display = 'inline-block';
        document.getElementById('studyPauseBtn').style.display = 'none';
    }

    async executeSort() {
        switch(this.currentAlgo) {
            case 'bubble': await this.bubbleSort(); break;
            case 'selection': await this.selectionSort(); break;
            case 'insertion': await this.insertionSort(); break;
            case 'merge': await this.mergeSortWrapper(); break;
            case 'quick': await this.quickSortWrapper(); break;
            case 'heap': await this.heapSort(); break;
            case 'shell': await this.shellSort(); break;
            case 'comb': await this.combSort(); break;
            case 'cocktail': await this.cocktailSort(); break;
            case 'gnome': await this.gnomeSort(); break;
            case 'radix': await this.radixSort(); break;
            default: await this.bubbleSort();
        }
    }

    async bubbleSort() {
        const n = this.array.length;
        this.updateStep(`Bubble Sort: Starting with ${n} elements. Will make ${n-1} passes through the array.`);
        await this.sleep(this.speed);
        
        for (let i = 0; i < n - 1; i++) {
            this.updateStep(`Pass ${i + 1}: Bubbling largest unsorted element to position ${n - i - 1}`);
            await this.sleep(this.speed);
            
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isPlaying) return;
                
                this.array[j].state = 'comparing';
                this.array[j + 1].state = 'comparing';
                this.renderArray();
                this.updateStep(`Pass ${i + 1}, Step ${j + 1}: Comparing ${this.array[j].value} and ${this.array[j + 1].value}. ${this.array[j].value > this.array[j + 1].value ? 'They are out of order!' : 'Already in correct order.'}`);
                await this.sleep(this.speed);
                
                if (this.array[j].value > this.array[j + 1].value) {
                    this.array[j].state = 'swapping';
                    this.array[j + 1].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Swapping ${this.array[j].value} and ${this.array[j + 1].value} because ${this.array[j].value} > ${this.array[j + 1].value}`);
                    await this.sleep(this.speed);
                    
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                }
                
                this.array[j].state = 'default';
                this.array[j + 1].state = 'default';
                this.renderArray();
            }
            this.array[n - i - 1].state = 'sorted';
            this.renderArray();
            this.updateStep(`Pass ${i + 1} complete: Element ${this.array[n - i - 1].value} is now in its final sorted position.`);
            await this.sleep(this.speed);
        }
        this.array[0].state = 'sorted';
        this.updateStep(`Bubble Sort complete! All elements are now sorted in ascending order.`);
    }

    async selectionSort() {
        const n = this.array.length;
        this.updateStep(`Selection Sort: Will find the minimum element and place it at the beginning in each iteration.`);
        await this.sleep(this.speed);
        
        for (let i = 0; i < n - 1; i++) {
            if (!this.isPlaying) return;
            
            let minIdx = i;
            this.array[minIdx].state = 'comparing';
            this.renderArray();
            this.updateStep(`Iteration ${i + 1}: Starting search from position ${i}. Current minimum: ${this.array[minIdx].value}`);
            await this.sleep(this.speed);
            
            for (let j = i + 1; j < n; j++) {
                if (!this.isPlaying) return;
                
                this.array[j].state = 'comparing';
                this.renderArray();
                this.updateStep(`Checking ${this.array[j].value}. Current minimum is ${this.array[minIdx].value}. ${this.array[j].value < this.array[minIdx].value ? 'Found new minimum!' : 'Not smaller than current minimum.'}`);
                await this.sleep(this.speed);
                
                if (this.array[j].value < this.array[minIdx].value) {
                    this.array[minIdx].state = 'default';
                    minIdx = j;
                    this.array[minIdx].state = 'comparing';
                    this.updateStep(`New minimum found: ${this.array[minIdx].value} at position ${minIdx}`);
                } else {
                    this.array[j].state = 'default';
                }
                this.renderArray();
            }
            
            if (minIdx !== i) {
                this.array[i].state = 'swapping';
                this.array[minIdx].state = 'swapping';
                this.renderArray();
                this.updateStep(`Minimum element found: ${this.array[minIdx].value}. Swapping with ${this.array[i].value} at position ${i}.`);
                await this.sleep(this.speed);
                
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
            } else {
                this.updateStep(`Element ${this.array[i].value} is already the minimum. No swap needed.`);
                await this.sleep(this.speed);
            }
            
            this.array[i].state = 'sorted';
            this.renderArray();
            this.updateStep(`Position ${i} now contains ${this.array[i].value} - sorted!`);
            await this.sleep(this.speed);
        }
        this.array[n - 1].state = 'sorted';
        this.updateStep(`Selection Sort complete! Found and placed minimum elements in order.`);
    }

    async insertionSort() {
        this.array[0].state = 'sorted';
        this.renderArray();
        this.updateStep(`Insertion Sort: First element ${this.array[0].value} is trivially sorted. Building sorted portion from left.`);
        await this.sleep(this.speed);
        
        for (let i = 1; i < this.array.length; i++) {
            if (!this.isPlaying) return;
            
            let key = this.array[i];
            key.state = 'comparing';
            this.renderArray();
            this.updateStep(`Iteration ${i}: Taking element ${key.value} from position ${i} to insert into sorted portion (positions 0 to ${i-1}).`);
            await this.sleep(this.speed);
            
            let j = i - 1;
            let shifts = 0;
            while (j >= 0 && this.array[j].value > key.value) {
                if (!this.isPlaying) return;
                
                this.array[j].state = 'swapping';
                this.renderArray();
                this.updateStep(`${this.array[j].value} > ${key.value}: Shifting ${this.array[j].value} one position right to make space.`);
                await this.sleep(this.speed);
                
                this.array[j + 1] = this.array[j];
                this.array[j].state = 'sorted';
                j--;
                shifts++;
                this.renderArray();
            }
            
            this.array[j + 1] = key;
            this.array[j + 1].state = 'sorted';
            this.renderArray();
            if (shifts > 0) {
                this.updateStep(`Inserted ${key.value} at position ${j + 1} after shifting ${shifts} element(s). Sorted portion now has ${i + 1} elements.`);
            } else {
                this.updateStep(`Element ${key.value} is already in correct position ${i}. No shifts needed.`);
            }
            await this.sleep(this.speed);
        }
        this.updateStep(`Insertion Sort complete! Built sorted array by inserting each element into its correct position.`);
    }

    async mergeSortWrapper() {
        this.updateStep('Merge Sort: Dividing array into smaller parts...');
        await this.mergeSort(0, this.array.length - 1);
    }

    async mergeSort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        if (!this.isPlaying) return;
        
        const leftArr = this.array.slice(left, mid + 1).map(item => ({...item}));
        const rightArr = this.array.slice(mid + 1, right + 1).map(item => ({...item}));
        
        this.updateStep(`Merging two sorted subarrays: [${leftArr.map(x => x.value).join(', ')}] and [${rightArr.map(x => x.value).join(', ')}]`);
        await this.sleep(this.speed);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (!this.isPlaying) return;
            
            this.array[k].state = 'comparing';
            this.renderArray();
            this.updateStep(`Comparing ${leftArr[i].value} (left) with ${rightArr[j].value} (right). Taking ${leftArr[i].value <= rightArr[j].value ? leftArr[i].value : rightArr[j].value} as it's smaller.`);
            await this.sleep(this.speed);
            
            if (leftArr[i].value <= rightArr[j].value) {
                this.array[k] = {...leftArr[i]};
                i++;
            } else {
                this.array[k] = {...rightArr[j]};
                j++;
            }
            this.array[k].state = 'sorted';
            k++;
            this.renderArray();
        }
        
        if (i < leftArr.length) {
            this.updateStep(`Left subarray has remaining elements. Copying them over...`);
            await this.sleep(this.speed);
        }
        while (i < leftArr.length) {
            this.array[k] = {...leftArr[i]};
            this.array[k].state = 'sorted';
            i++; k++;
            this.renderArray();
        }
        
        if (j < rightArr.length) {
            this.updateStep(`Right subarray has remaining elements. Copying them over...`);
            await this.sleep(this.speed);
        }
        while (j < rightArr.length) {
            this.array[k] = {...rightArr[j]};
            this.array[k].state = 'sorted';
            j++; k++;
            this.renderArray();
        }
        
        this.updateStep(`Merge complete! Segment from index ${left} to ${right} is now sorted.`);
        await this.sleep(this.speed);
    }

    async quickSortWrapper() {
        this.updateStep('Quick Sort: Partitioning array...');
        await this.quickSort(0, this.array.length - 1);
    }

    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        if (!this.isPlaying) return high;
        
        const pivot = this.array[high];
        pivot.state = 'comparing';
        this.updateStep(`Quick Sort Partitioning: Selected ${pivot.value} (last element) as pivot. Will arrange elements: smaller to left, larger to right.`);
        this.renderArray();
        await this.sleep(this.speed);
        
        let i = low - 1;
        let smallerCount = 0;
        
        for (let j = low; j < high; j++) {
            if (!this.isPlaying) return high;
            
            this.array[j].state = 'comparing';
            this.renderArray();
            this.updateStep(`Checking ${this.array[j].value}. Is it less than pivot ${pivot.value}? ${this.array[j].value < pivot.value ? 'Yes! Moving to left side.' : 'No, stays on right side.'}`);
            await this.sleep(this.speed);
            
            if (this.array[j].value < pivot.value) {
                i++;
                smallerCount++;
                this.array[i].state = 'swapping';
                this.array[j].state = 'swapping';
                this.renderArray();
                this.updateStep(`Swapping ${this.array[j].value} with ${this.array[i].value} to move smaller element left. Found ${smallerCount} elements smaller than pivot so far.`);
                await this.sleep(this.speed);
                
                [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
            }
            
            this.array[j].state = 'default';
            this.renderArray();
        }
        
        this.updateStep(`Partition phase complete. Found ${smallerCount} elements smaller than pivot. Now placing pivot ${pivot.value} at position ${i + 1}.`);
        await this.sleep(this.speed);
        
        [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
        this.array[i + 1].state = 'sorted';
        this.renderArray();
        this.updateStep(`Pivot ${this.array[i + 1].value} is now in its final sorted position ${i + 1}. Elements before it are smaller, elements after are larger.`);
        await this.sleep(this.speed);
        
        return i + 1;
    }

    async heapSort() {
        const n = this.array.length;
        this.updateStep(`Heap Sort: Building a max heap from ${n} elements. Parent nodes will be larger than children.`);
        await this.sleep(this.speed);

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        this.updateStep(`Max heap built! Largest element ${this.array[0].value} is at the root.`);
        await this.sleep(this.speed);

        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            if (!this.isPlaying) return;
            
            this.array[0].state = 'swapping';
            this.array[i].state = 'swapping';
            this.renderArray();
            this.updateStep(`Extracting max ${this.array[0].value} from heap. Swapping with last unsorted element ${this.array[i].value}.`);
            await this.sleep(this.speed);

            [this.array[0], this.array[i]] = [this.array[i], this.array[0]];
            this.array[i].state = 'sorted';
            this.renderArray();
            
            await this.heapify(i, 0);
        }
        this.array[0].state = 'sorted';
        this.updateStep(`Heap Sort complete! Extracted elements in descending order to build sorted array.`);
    }

    async heapify(n, i) {
        if (!this.isPlaying) return;
        
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            this.array[left].state = 'comparing';
            this.renderArray();
        }
        if (right < n) {
            this.array[right].state = 'comparing';
            this.renderArray();
        }
        
        if (left < n && this.array[left].value > this.array[largest].value) {
            largest = left;
        }
        if (right < n && this.array[right].value > this.array[largest].value) {
            largest = right;
        }

        if (largest !== i) {
            this.array[i].state = 'swapping';
            this.array[largest].state = 'swapping';
            this.renderArray();
            this.updateStep(`Heapifying: ${this.array[largest].value} > ${this.array[i].value}. Swapping to maintain heap property.`);
            await this.sleep(this.speed / 2);

            [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
            this.array[i].state = 'default';
            this.array[largest].state = 'default';
            this.renderArray();

            await this.heapify(n, largest);
        } else {
            if (left < n) this.array[left].state = 'default';
            if (right < n) this.array[right].state = 'default';
            this.renderArray();
        }
    }

    async shellSort() {
        const n = this.array.length;
        let gap = Math.floor(n / 2);
        
        this.updateStep(`Shell Sort: Starting with gap = ${gap}. Will sort elements that are 'gap' distance apart.`);
        await this.sleep(this.speed);

        while (gap > 0) {
            this.updateStep(`Current gap: ${gap}. Performing insertion sort on elements ${gap} positions apart.`);
            await this.sleep(this.speed);

            for (let i = gap; i < n; i++) {
                if (!this.isPlaying) return;
                
                let temp = this.array[i];
                temp.state = 'comparing';
                this.renderArray();
                
                let j = i;
                while (j >= gap && this.array[j - gap].value > temp.value) {
                    if (!this.isPlaying) return;
                    
                    this.array[j - gap].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Gap ${gap}: Moving ${this.array[j - gap].value} right. ${temp.value} will be inserted later.`);
                    await this.sleep(this.speed);
                    
                    this.array[j] = this.array[j - gap];
                    this.array[j].state = 'default';
                    j -= gap;
                    this.renderArray();
                }
                
                this.array[j] = temp;
                this.array[j].state = 'default';
                this.renderArray();
            }
            
            gap = Math.floor(gap / 2);
            if (gap > 0) {
                this.updateStep(`Gap reduced to ${gap}. Array is becoming more sorted.`);
                await this.sleep(this.speed);
            }
        }
        this.updateStep(`Shell Sort complete! Final pass with gap=1 ensured full sorting.`);
    }

    async combSort() {
        const n = this.array.length;
        let gap = n;
        const shrink = 1.3;
        let sorted = false;

        this.updateStep(`Comb Sort: Like Bubble Sort but with decreasing gaps. Starting gap = ${n}.`);
        await this.sleep(this.speed);

        while (!sorted) {
            gap = Math.floor(gap / shrink);
            if (gap <= 1) {
                gap = 1;
                sorted = true;
            }

            this.updateStep(`Current gap: ${gap}. Comparing elements ${gap} positions apart.`);
            await this.sleep(this.speed);

            for (let i = 0; i + gap < n; i++) {
                if (!this.isPlaying) return;

                this.array[i].state = 'comparing';
                this.array[i + gap].state = 'comparing';
                this.renderArray();
                this.updateStep(`Comparing ${this.array[i].value} with ${this.array[i + gap].value} (gap ${gap}).`);
                await this.sleep(this.speed);

                if (this.array[i].value > this.array[i + gap].value) {
                    this.array[i].state = 'swapping';
                    this.array[i + gap].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Swapping ${this.array[i].value} and ${this.array[i + gap].value}.`);
                    await this.sleep(this.speed);

                    [this.array[i], this.array[i + gap]] = [this.array[i + gap], this.array[i]];
                    sorted = false;
                }

                this.array[i].state = 'default';
                this.array[i + gap].state = 'default';
                this.renderArray();
            }
        }
        this.updateStep(`Comb Sort complete! Gap reduced to 1 with no swaps needed.`);
    }

    async cocktailSort() {
        let start = 0;
        let end = this.array.length - 1;
        let swapped = true;

        this.updateStep(`Cocktail Sort: Bidirectional Bubble Sort. Will bubble in both directions.`);
        await this.sleep(this.speed);

        while (swapped) {
            swapped = false;

            // Forward pass (left to right)
            this.updateStep(`Forward pass: Bubbling largest to the right (positions ${start} to ${end}).`);
            await this.sleep(this.speed);

            for (let i = start; i < end; i++) {
                if (!this.isPlaying) return;

                this.array[i].state = 'comparing';
                this.array[i + 1].state = 'comparing';
                this.renderArray();
                await this.sleep(this.speed);

                if (this.array[i].value > this.array[i + 1].value) {
                    this.array[i].state = 'swapping';
                    this.array[i + 1].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Forward: Swapping ${this.array[i].value} and ${this.array[i + 1].value}.`);
                    await this.sleep(this.speed);

                    [this.array[i], this.array[i + 1]] = [this.array[i + 1], this.array[i]];
                    swapped = true;
                }

                this.array[i].state = 'default';
                this.array[i + 1].state = 'default';
                this.renderArray();
            }

            this.array[end].state = 'sorted';
            this.renderArray();
            end--;

            if (!swapped) break;
            swapped = false;

            // Backward pass (right to left)
            this.updateStep(`Backward pass: Bubbling smallest to the left (positions ${end} to ${start}).`);
            await this.sleep(this.speed);

            for (let i = end; i > start; i--) {
                if (!this.isPlaying) return;

                this.array[i].state = 'comparing';
                this.array[i - 1].state = 'comparing';
                this.renderArray();
                await this.sleep(this.speed);

                if (this.array[i].value < this.array[i - 1].value) {
                    this.array[i].state = 'swapping';
                    this.array[i - 1].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Backward: Swapping ${this.array[i - 1].value} and ${this.array[i].value}.`);
                    await this.sleep(this.speed);

                    [this.array[i], this.array[i - 1]] = [this.array[i - 1], this.array[i]];
                    swapped = true;
                }

                this.array[i].state = 'default';
                this.array[i - 1].state = 'default';
                this.renderArray();
            }

            this.array[start].state = 'sorted';
            this.renderArray();
            start++;
        }
        this.updateStep(`Cocktail Sort complete! Array sorted with bidirectional passes.`);
    }

    async gnomeSort() {
        let pos = 0;
        const n = this.array.length;

        this.updateStep(`Gnome Sort: Like a garden gnome sorting flower pots. Move forward if in order, swap and go back if not.`);
        await this.sleep(this.speed);

        while (pos < n) {
            if (!this.isPlaying) return;

            if (pos === 0) {
                pos++;
                this.updateStep(`Position 0: Moving forward.`);
                await this.sleep(this.speed / 2);
            } else {
                this.array[pos].state = 'comparing';
                this.array[pos - 1].state = 'comparing';
                this.renderArray();
                this.updateStep(`At position ${pos}: Comparing ${this.array[pos].value} with ${this.array[pos - 1].value}.`);
                await this.sleep(this.speed);

                if (this.array[pos].value >= this.array[pos - 1].value) {
                    this.array[pos].state = 'default';
                    this.array[pos - 1].state = 'default';
                    this.renderArray();
                    this.updateStep(`In order! Moving forward.`);
                    pos++;
                } else {
                    this.array[pos].state = 'swapping';
                    this.array[pos - 1].state = 'swapping';
                    this.renderArray();
                    this.updateStep(`Out of order! Swapping ${this.array[pos].value} and ${this.array[pos - 1].value}, then stepping back.`);
                    await this.sleep(this.speed);

                    [this.array[pos], this.array[pos - 1]] = [this.array[pos - 1], this.array[pos]];
                    this.array[pos].state = 'default';
                    this.array[pos - 1].state = 'default';
                    this.renderArray();
                    pos--;
                }
            }
        }
        this.updateStep(`Gnome Sort complete! The garden gnome has sorted all the pots.`);
    }

    async radixSort() {
        const max = Math.max(...this.array.map(x => x.value));
        const maxDigits = Math.floor(Math.log10(max)) + 1;

        this.updateStep(`Radix Sort: Sorting by each digit position. Max value ${max} has ${maxDigits} digit(s).`);
        await this.sleep(this.speed);

        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            if (!this.isPlaying) return;

            const digitPos = Math.floor(Math.log10(exp)) + 1;
            this.updateStep(`Sorting by digit position ${digitPos} (${exp}'s place).`);
            await this.sleep(this.speed);

            await this.countingSort(exp);
        }
        this.updateStep(`Radix Sort complete! Sorted all digit positions from least to most significant.`);
    }

    async countingSort(exp) {
        const n = this.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);

        // Count occurrences of each digit
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(this.array[i].value / exp) % 10;
            count[digit]++;
            this.array[i].state = 'comparing';
            this.renderArray();
            this.updateStep(`Element ${this.array[i].value}: digit at this position is ${digit}.`);
            await this.sleep(this.speed / 2);
            this.array[i].state = 'default';
        }

        // Change count to contain positions
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // Build output array
        for (let i = n - 1; i >= 0; i--) {
            if (!this.isPlaying) return;
            
            const digit = Math.floor(this.array[i].value / exp) % 10;
            output[count[digit] - 1] = {...this.array[i]};
            count[digit]--;
            
            this.array[i].state = 'swapping';
            this.renderArray();
            this.updateStep(`Placing ${this.array[i].value} (digit ${digit}) at position ${count[digit]}.`);
            await this.sleep(this.speed / 2);
            this.array[i].state = 'default';
        }

        // Copy output to array
        for (let i = 0; i < n; i++) {
            this.array[i] = output[i];
            this.array[i].state = 'sorted';
            this.renderArray();
        }
        
        this.updateStep(`Digit position sorted! Array rearranged based on current digit.`);
        await this.sleep(this.speed);
        
        // Reset states for next iteration
        for (let i = 0; i < n; i++) {
            this.array[i].state = 'default';
        }
        this.renderArray();
    }
}

// ========== COMPARE MODE ==========
class CompareMode {
    constructor() {
        this.visualizer1 = null;
        this.visualizer2 = null;
        this.sharedArray = [];
    }

    init() {
        const arraySize = parseInt(document.getElementById('arraySize').value);
        const colors = window.themeManager.getColors();
        
        this.sharedArray = [];
        for (let i = 0; i < arraySize; i++) {
            this.sharedArray.push({
                value: ((i + 1) / arraySize) * 100,
                color: colors.barDefault
            });
        }
        
        for (let i = this.sharedArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.sharedArray[i], this.sharedArray[j]] = [this.sharedArray[j], this.sharedArray[i]];
        }
        
        this.visualizer1 = new SortingVisualizer('visualizer1', '1', true);
        this.visualizer2 = new SortingVisualizer('visualizer2', '2', true);
        
        this.visualizer1.arraySize = arraySize;
        this.visualizer2.arraySize = arraySize;
        
        this.visualizer1.setArrayFromSource(this.sharedArray);
        this.visualizer2.setArrayFromSource(this.sharedArray);
        
        this.visualizer1.draw();
        this.visualizer2.draw();
        
        // Set initial algorithm values from dropdowns
        const algo1 = document.getElementById('algo1Select').value;
        const algo2 = document.getElementById('algo2Select').value;
        
        this.visualizer1.currentAlgorithm = algo1;
        this.visualizer2.currentAlgorithm = algo2;
    }

    getAlgoName(value) {
        const names = {
            bubble: 'Bubble Sort', selection: 'Selection Sort', insertion: 'Insertion Sort',
            merge: 'Merge Sort', quick: 'Quick Sort', heap: 'Heap Sort',
            shell: 'Shell Sort', comb: 'Comb Sort', cocktail: 'Cocktail Sort',
            gnome: 'Gnome Sort', cycle: 'Cycle Sort', pancake: 'Pancake Sort',
            tim: 'Tim Sort', intro: 'Intro Sort', bitonic: 'Bitonic Sort',
            radix: 'Radix Sort (LSD)'
        };
        return names[value] || value;
    }

    async play() {
        if (!this.visualizer1 || !this.visualizer2) this.init();
        
        // Get algorithms from compare mode dropdowns
        const algo1 = document.getElementById('algo1Select').value;
        const algo2 = document.getElementById('algo2Select').value;
        
        this.visualizer1.currentAlgorithm = algo1;
        this.visualizer2.currentAlgorithm = algo2;
        
        // Get current speed from main visualizer or slider
        const speed = window.mainVisualizer ? window.mainVisualizer.speed : parseInt(document.getElementById('speed').value);
        
        this.visualizer1.speed = speed;
        this.visualizer2.speed = speed;
        this.visualizer1._sleepCounter = 0;
        this.visualizer2._sleepCounter = 0;
        
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        
        // Reset stats
        this.visualizer1.resetStats();
        this.visualizer2.resetStats();
        
        // Start timing
        const startTime = Date.now();
        let timer1 = setInterval(() => {
            if (this.visualizer1.isRunning) {
                this.visualizer1.updateTime(Date.now() - startTime);
            } else {
                clearInterval(timer1);
            }
        }, 100);
        
        let timer2 = setInterval(() => {
            if (this.visualizer2.isRunning) {
                this.visualizer2.updateTime(Date.now() - startTime);
            } else {
                clearInterval(timer2);
            }
        }, 100);
        
        await Promise.all([this.visualizer1.play(), this.visualizer2.play()]);
        
        clearInterval(timer1);
        clearInterval(timer2);
        
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    }

    pause() {
        if (this.visualizer1) this.visualizer1.pause();
        if (this.visualizer2) this.visualizer2.pause();
    }

    reset() { this.init(); }
    shuffle() { this.init(); }
    
    setPreset(type) {
        if (!this.visualizer1 || !this.visualizer2) this.init();
        
        const arraySize = parseInt(document.getElementById('arraySize').value);
        this.sharedArray = [];
        
        for (let i = 0; i < arraySize; i++) {
            let value;
            switch(type) {
                case 'reverse':
                    value = ((arraySize - i) / arraySize) * 100;
                    break;
                case 'valley':
                    const mid = arraySize / 2;
                    value = (Math.abs(i - mid) / mid) * 100;
                    break;
                case 'mountain':
                    const center = arraySize / 2;
                    value = (1 - Math.abs(i - center) / center) * 100;
                    break;
                default:
                    value = ((i + 1) / arraySize) * 100;
            }
            this.sharedArray.push({
                value: value,
                color: window.themeManager.getColors().barDefault
            });
        }
        
        this.visualizer1.setArrayFromSource(this.sharedArray);
        this.visualizer2.setArrayFromSource(this.sharedArray);
        this.visualizer1.draw();
        this.visualizer2.draw();
        this.visualizer1.resetStats();
        this.visualizer2.resetStats();
    }
}

// ========== INITIALIZATION ==========
window.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.audioEngine = new AudioEngine();
    
    const mainVisualizer = new SortingVisualizer();
    window.compareMode = new CompareMode();
    window.benchmarkMode = new BenchmarkMode();
    window.studyMode = new StudyMode();
    window.mainVisualizer = mainVisualizer;
    
    // Benchmark mode controls
    const benchmarkStartBtn = document.getElementById('benchmarkStartBtn');
    const benchmarkStopBtn = document.getElementById('benchmarkStopBtn');
    const benchmarkCase = document.getElementById('benchmarkCase');
    
    if (benchmarkStartBtn) {
        benchmarkStartBtn.addEventListener('click', () => {
            console.log('Start Benchmark clicked');
            window.benchmarkMode.play();
        });
    }
    
    if (benchmarkStopBtn) {
        benchmarkStopBtn.addEventListener('click', () => {
            window.benchmarkMode.stop();
            benchmarkStartBtn.style.display = 'inline-block';
            benchmarkStopBtn.style.display = 'none';
        });
    }
    
    if (benchmarkCase) {
        benchmarkCase.addEventListener('change', (e) => {
            window.benchmarkMode.generateArray(e.target.value);
        });
    }
    
    // Leaderboard filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.benchmarkMode.updateLeaderboard(btn.dataset.filter);
        });
    });
    
    // Update algorithm selector when algo buttons are clicked
    document.querySelectorAll('.algo-btn:not(.compare-toggle):not(.benchmark-toggle):not(.study-toggle)').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('algorithm').value = btn.dataset.algo;
        });
    });
});
