# AI Speech Synthesis Visualizer

Interactive visualization of modern Text-to-Speech (TTS) pipelines including FastSpeech2, Tacotron2, and VITS.

## Demo

![Demo](public/screenshot.png)

---

## Features

- FastSpeech2 pipeline visualization
- Tacotron2 pipeline visualization
- VITS architecture overview
- Text → Phoneme conversion demo
- Spectrogram generation visualization
- Vocoder processing simulation
- Audio playback controls
- Voice and language selection
- Interactive step-by-step workflow

---

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Web Speech API

---

## AI Concepts Covered

### FastSpeech2

- Non-autoregressive TTS
- Variance adaptor
- Fast inference

### Tacotron2

- Autoregressive architecture
- Mel spectrogram generation
- Attention mechanism

### VITS

- End-to-end TTS
- Variational inference
- Adversarial training

### Speech Synthesis Pipeline

Text Input

↓

Phoneme Processing

↓

Spectrogram Generation

↓

Vocoder

↓

Audio Output

---

## Installation

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Project Structure

```text
app/
├── page.tsx
├── layout.tsx

public/

README.md
package.json
```

---

## Author

Pham Gia Huy

- GitHub: https://github.com/HuyBruce
- LinkedIn: https://linkedin.com/in/huy-bruce
