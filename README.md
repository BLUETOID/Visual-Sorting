# Visual Sorting Algorithm

A comprehensive, interactive web application for visualizing and learning sorting algorithms. Built with vanilla HTML, CSS, and JavaScript.

![Visual Sorting Algorithm](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

### Sorting Algorithms
Visualize **16 different sorting algorithms** with real-time animations:

| Algorithm | Time Complexity (Best) | Time Complexity (Avg) | Time Complexity (Worst) | Space |
|-----------|----------------------|----------------------|------------------------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |
| Shell Sort | O(n log n) | O(n^1.3) | O(n²) | O(1) |
| Radix Sort | O(nk) | O(nk) | O(nk) | O(n+k) |
| Comb Sort | O(n log n) | O(n²) | O(n²) | O(1) |
| Cocktail Sort | O(n) | O(n²) | O(n²) | O(1) |
| Gnome Sort | O(n) | O(n²) | O(n²) | O(1) |
| Cycle Sort | O(n²) | O(n²) | O(n²) | O(1) |
| Pancake Sort | O(n) | O(n²) | O(n²) | O(1) |
| Tim Sort | O(n) | O(n log n) | O(n log n) | O(n) |
| Intro Sort | O(n log n) | O(n log n) | O(n log n) | O(log n) |
| Bitonic Sort | O(log²n) | O(log²n) | O(log²n) | O(n log²n) |

### Visualization Modes

#### Single Mode
- Visualize one algorithm at a time
- Adjustable array size (10-500 elements)
- Variable speed control
- Multiple visualization shapes (Triangle, Circle, Bar, Line, Dot, Diamond)

#### Compare Mode
- Side-by-side comparison of two algorithms
- Synchronized array data
- Real-time statistics (comparisons, swaps, time)

#### Benchmark Mode
- Race all algorithms simultaneously
- Performance leaderboard
- Time and comparison metrics

#### Study Mode
- **Interactive Learning**: Step through algorithms one operation at a time
- **Code Examples**: View implementation code for each algorithm
- **Complexity Analysis**: Understand time and space complexity
- **Visual Explanations**: Color-coded array elements show:
  - 🟡 Yellow: Elements being compared
  - 🔴 Red: Elements being swapped
  - 🟢 Green: Sorted elements

### Additional Features

- **8 Color Themes**: Dark, Light, Ocean, Forest, Sunset, Midnight, Lavender, Cyberpunk
- **Sound Effects**: 8 different sound types with volume control
- **Array Patterns**: Shuffle, Reverse, Valley, Mountain
- **Custom Arrays**: Input your own values
- **Keyboard Shortcuts**: Quick controls for power users
- **Responsive Design**: Works on desktop and tablet

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/visual-sorting-algorithm.git
```

2. Navigate to the project folder:
```bash
cd visual-sorting-algorithm
```

3. Open `index.html` in your browser:
```bash
# On Windows
start index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

Or use a local development server like Live Server in VS Code.

## Usage

### Basic Controls

| Action | Control |
|--------|---------|
| Start Sorting | Click "Start" button or press `Space` |
| Stop Sorting | Click "Stop" button |
| Step Through | Click "Step" button |
| Shuffle Array | Click "Shuffle" button |
| Change Algorithm | Click algorithm buttons at bottom |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop sorting |
| `R` | Shuffle array |
| `+` / `-` | Increase/Decrease speed |
| `↑` / `↓` | Increase/Decrease array size |

### Study Mode

1. Click **"Study Mode"** button
2. Select an algorithm from the sidebar
3. Use **Play** for automatic visualization or **Step** for manual control
4. Switch between **Overview**, **Code**, and **Complexity** tabs
5. Watch the "Current Step" panel for explanations

## Project Structure

```
visual-sorting-algorithm/
├── index.html      # Main HTML structure
├── styles.css      # All styling and themes
├── script.js       # JavaScript logic and algorithms
└── README.md       # Documentation
```

## Technical Details

### Architecture
- **Pure Vanilla JS**: No frameworks or libraries
- **Canvas API**: Used for main visualization rendering
- **Web Audio API**: For sound generation
- **CSS Custom Properties**: For theming system
- **LocalStorage**: For saving user preferences

### Performance
- Optimized rendering with requestAnimationFrame
- Efficient array operations
- Throttled UI updates during sorting

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- Add more sorting algorithms
- Improve mobile responsiveness
- Add more visualization styles
- Create algorithm tutorials
- Add unit tests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by various sorting visualizers
- Sound design using Web Audio API oscillators
- Color themes designed for accessibility

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for learning sorting algorithms**
