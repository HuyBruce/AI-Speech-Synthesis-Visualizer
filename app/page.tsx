"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Volume2,
  AudioWaveform,
  FileText,
  Languages,
  BarChart3,
 Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Square,
  Zap,
  Mic,
  Moon,
  Sun,
  Cpu,
} from "lucide-react";

const models = [
  {
    id: "fastspeech2",
    name: "FastSpeech 2",
    type: "Non-autoregressive",
    speed: "Very Fast",
    quality: "High",
    latency: "Low",

    pipeline: [
      "Text Input",
      "Phoneme",
      "Variance Adaptor",
      "Mel Spectrogram",
      "HiFi-GAN",
      "Audio",
    ],

    description:
      "FastSpeech 2 là model TTS hiện đại dùng trong production.",
  },

  {
    id: "tacotron2",
    name: "Tacotron 2",
    type: "Autoregressive",
    speed: "Slow",
    quality: "Very High",
    latency: "Medium",

    pipeline: [
      "Text Input",
      "Encoder",
      "Attention",
      "Decoder",
      "Mel Spectrogram",
      "WaveNet",
      "Audio",
    ],

    description:
      "Tacotron 2 là kiến trúc TTS nổi tiếng của Google.",
  },

  {
    id: "vits",
    name: "VITS",
    type: "End-to-End",
    speed: "Fast",
    quality: "SOTA",
    latency: "Very Low",

    pipeline: [
      "Text Input",
      "Posterior Encoder",
      "Flow",
      "Decoder",
      "Waveform",
      "Audio",
    ],

    description:
      "VITS là model end-to-end hiện đại với chất lượng rất cao.",
  },
];

const pipeline = [
  {
    id: 1,
    title: "Text input",
    subtitle: "raw text",
    icon: FileText,
    heading: "Nhận văn bản đầu vào",
    description:
      "Người dùng nhập văn bản hoặc dùng microphone để tạo text.",
  },

  {
    id: 2,
    title: "Phoneme",
    subtitle: "text analysis",
    icon: Languages,
    heading: "Phân tích phoneme",
    description:
      "Mô hình G2P chuyển văn bản thành chuỗi âm vị.",
  },

  {
    id: 3,
    title: "Spectrogram",
    subtitle: "acoustic model",
    icon: BarChart3,
    heading: "Tạo Mel-Spectrogram",
    description:
      "Acoustic model tạo mel spectrogram từ phoneme.",
  },

  {
    id: 4,
    title: "Vocoder",
    subtitle: "WaveNet-style",
    icon: AudioWaveform,
    heading: "Sinh waveform",
    description:
      "Neural vocoder tạo waveform audio thật.",
  },

  {
    id: 5,
    title: "Audio out",
    subtitle: "speech",
    icon: Volume2,
    heading: "Phát âm thanh",
    description:
      "Waveform được phát ra loa thành giọng nói.",
  },
];

const presets = [
  "Xin chào. Đây là demo AI speech synthesis trực quan.",

  "Speech synthesis converts text into natural sounding audio.",

  "FastSpeech 2 is a non autoregressive text to speech model.",

  "WaveNet generates audio sample by sample.",
];

export default function TTSDemo() {
  const [darkMode, setDarkMode] =
    useState(false);

  const [selectedModel, setSelectedModel] =
    useState(models[0]);

  const [text, setText] = useState(
    "Xin chào. Đây là demo AI speech synthesis trực quan."
  );

  const [voices, setVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  const [selectedVoice, setSelectedVoice] =
    useState("");

  const [rate, setRate] = useState(1);

  const [pitch, setPitch] = useState(1);

  const [pipelineSpeed, setPipelineSpeed] =
    useState(1);

  const [activeStep, setActiveStep] =
    useState(1);

  const [pipelineStep, setPipelineStep] =
    useState(0);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [autoPlaying, setAutoPlaying] =
    useState(false);

  const [visualizerData, setVisualizerData] =
    useState<number[]>([]);

  const [latency, setLatency] =
    useState(0);

  const [
    detectedLanguage,
    setDetectedLanguage,
  ] = useState("vi-VN");

  const timeoutRefs = useRef<
    NodeJS.Timeout[]
  >([]);

  useEffect(() => {
  const hasVietnamese =
    /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
      text
    );

  const hasChinese =
    /[\u4E00-\u9FFF]/.test(text);

  const hasJapanese =
    /[\u3040-\u30ff]/.test(text);

  const hasKorean =
    /[\uac00-\ud7af]/.test(text);

  if (hasVietnamese) {
    setDetectedLanguage("vi-VN");
  } else if (hasChinese) {
    setDetectedLanguage("zh-CN");
  } else if (hasJapanese) {
    setDetectedLanguage("ja-JP");
  } else if (hasKorean) {
    setDetectedLanguage("ko-KR");
  } else {
    setDetectedLanguage("en-US");
  }
}, [text]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices =
        speechSynthesis.getVoices();

      setVoices(availableVoices);

      if (
        availableVoices.length > 0 &&
        !selectedVoice
      ) {
        const vietnameseVoice =
          availableVoices.find(
            (v) =>
              v.lang.includes("vi") ||
              v.name
                .toLowerCase()
                .includes("vietnam")
          );

        if (vietnameseVoice) {
          setSelectedVoice(
            vietnameseVoice.name
          );
        } else {
          setSelectedVoice(
            availableVoices[0].name
          );
        }
      }
    };

    loadVoices();

    speechSynthesis.onvoiceschanged =
      loadVoices;
  }, [selectedVoice]);

  const phonemes = useMemo(() => {
    return text
      .split("")
      .filter((c) => c.trim() !== "")
      .slice(0, 30);
  }, [text]);

  useEffect(() => {
    if (!isSpeaking) return;

    const interval = setInterval(() => {
      const data = Array.from(
        { length: 60 },
        () => Math.random() * 100
      );

      setVisualizerData(data);
    }, 80);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const current =
    pipeline[activeStep - 1];

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(
      (timeout) => clearTimeout(timeout)
    );

    timeoutRefs.current = [];
  };

  const stopSpeaking = () => {
    clearAllTimeouts();

    speechSynthesis.cancel();

    setPipelineStep(0);

    setIsSpeaking(false);

    setAutoPlaying(false);
  };

  const resetAll = () => {
    stopSpeaking();

    setActiveStep(1);
  };

  const nextStep = () => {
    if (autoPlaying) return;

    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (autoPlaying) return;

    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const speakAudio = () => {
    stopSpeaking();

    setAutoPlaying(true);

    const utterance =
      new SpeechSynthesisUtterance(text);

    const voice = voices.find(
      (v) => v.name === selectedVoice
    );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;

    utterance.pitch = pitch;

    utterance.lang = detectedLanguage;

    const start = performance.now();

    const modelMultiplier =
      selectedModel.id === "tacotron2"
        ? 1.5
        : selectedModel.id === "vits"
        ? 0.8
        : 1;

    const base =
      (1200 * modelMultiplier) /
      pipelineSpeed;

    const timeline = [
      { step: 1, delay: base * 0.5 },

      { step: 2, delay: base * 1.5 },

      { step: 3, delay: base * 2.5 },

      { step: 4, delay: base * 3.5 },

      { step: 5, delay: base * 4.5 },
    ];

    timeline.forEach(
      ({ step, delay }) => {
        const timeout = setTimeout(() => {
          setPipelineStep(step);

          setActiveStep(step);
        }, delay);

        timeoutRefs.current.push(timeout);
      }
    );

    const speakTimeout = setTimeout(() => {
      const fakeLatency =
        selectedModel.id === "tacotron2"
          ? Math.floor(
              700 + Math.random() * 500
            )
          : selectedModel.id === "vits"
          ? Math.floor(
              120 + Math.random() * 120
            )
          : Math.floor(
              250 + Math.random() * 200
            );

      setLatency(fakeLatency);

      setIsSpeaking(true);

      speechSynthesis.speak(utterance);
    }, base * 5);

    timeoutRefs.current.push(speakTimeout);

    utterance.onend = () => {
      setIsSpeaking(false);

      setAutoPlaying(false);
    };
  };

 const speakNow = () => {
  stopSpeaking();

  const utterance =
    new SpeechSynthesisUtterance(text);

  const voice = voices.find(
    (v) => v.name === selectedVoice
  );

  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = rate;

  utterance.pitch = pitch;

  utterance.lang = detectedLanguage;

  setPipelineStep(5);

  setActiveStep(5);

  setIsSpeaking(true);

  const fakeLatency =
    selectedModel.id === "tacotron2"
      ? Math.floor(
          700 + Math.random() * 500
        )
      : selectedModel.id === "vits"
      ? Math.floor(
          120 + Math.random() * 120
        )
      : Math.floor(
          250 + Math.random() * 200
        );

  setLatency(fakeLatency);

  speechSynthesis.speak(utterance);

  utterance.onend = () => {
    setIsSpeaking(false);
  };
};
  const startMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "SpeechRecognition not supported"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = detectedLanguage;

    recognition.start();

    recognition.onresult = (
      event: any
    ) => {
      const transcript =
        event.results[0][0].transcript;

      setText(transcript);
    };
  };

  return (
    <div
      className={`min-h-screen p-8 transition-all duration-500
      
      ${
        darkMode
          ? "bg-[#09090b] text-white"
          : "bg-[#f6f5f2] text-zinc-900"
      }
      `}
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Speech Synthesis Demo
            </h1>

            <p
              className={`mt-3 text-xl
              
              ${
                darkMode
                  ? "text-zinc-400"
                  : "text-zinc-500"
              }
              `}
            >
              synchronized realtime AI
              pipeline
            </p>
          </div>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="rounded-2xl border border-zinc-500 px-6 py-4"
          >
            {darkMode ? (
              <Sun />
            ) : (
              <Moon />
            )}
          </button>
        </div>

        {/* MODEL SELECTOR */}

        <div
          className={`mt-8 rounded-3xl border p-8

          ${
            darkMode
              ? "border-zinc-800 bg-zinc-900"
              : "border-zinc-300 bg-white"
          }
          `}
        >
          <div className="mb-6 flex items-center gap-3">
            <Cpu className="h-8 w-8" />

            <h2 className="text-3xl font-bold">
              AI Models
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {models.map((model) => {
              const active =
                selectedModel.id ===
                model.id;

              return (
                <button
                  key={model.id}
                  onClick={() =>
                    setSelectedModel(model)
                  }
                  className={`rounded-3xl border p-6 text-left transition-all duration-500

                  ${
                    active
                      ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                      : darkMode
                      ? "border-zinc-700 bg-zinc-800"
                      : "border-zinc-200 bg-zinc-50"
                  }
                  `}
                >
                  <h3 className="text-3xl font-bold">
                    {model.name}
                  </h3>

                  <div className="mt-5 space-y-2 text-lg">
                    <p>
                      <span className="font-semibold">
                        Type:
                      </span>{" "}
                      {model.type}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Speed:
                      </span>{" "}
                      {model.speed}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Quality:
                      </span>{" "}
                      {model.quality}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Latency:
                      </span>{" "}
                      {model.latency}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIPELINE */}

        <div
          className={`mt-8 rounded-3xl border p-8

          ${
            darkMode
              ? "border-zinc-800 bg-zinc-900"
              : "border-zinc-300 bg-white"
          }
          `}
        >
          <div className="flex flex-wrap gap-4">
            {pipeline.map((item, index) => {
              const Icon = item.icon;

              const active =
                pipelineStep === item.id;

              const done =
                pipelineStep > item.id;

              return (
                <div
                  key={item.id}
                  className={`relative min-w-[180px] flex-1 rounded-3xl border p-6 transition-all duration-500

                  ${
                    active
                      ? "border-blue-500 bg-blue-500/10 scale-[1.03]"
                      : done
                      ? "border-green-500 bg-green-500/10"
                      : darkMode
                      ? "border-zinc-700 bg-zinc-800"
                      : "border-zinc-200 bg-zinc-50"
                  }
                  `}
                >
                  <div className="flex justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-white

                      ${
                        active
                          ? "bg-blue-500"
                          : done
                          ? "bg-green-600"
                          : "bg-zinc-400"
                      }
                      `}
                    >
                      {done ? (
                        <Check size={22} />
                      ) : (
                        <Icon size={22} />
                      )}
                    </div>
                  </div>

                  <div className="mt-5 text-center">
                    <h2 className="text-2xl font-semibold">
                      {item.title}
                    </h2>

                    <p
                      className={`mt-2

                      ${
                        darkMode
                          ? "text-zinc-400"
                          : "text-zinc-500"
                      }
                      `}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  {index !==
                    pipeline.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-zinc-400 lg:block">
                      ›
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CURRENT STEP */}

        <div
          className={`mt-8 rounded-3xl border p-10

          ${
            darkMode
              ? "border-zinc-800 bg-zinc-900"
              : "border-zinc-300 bg-white"
          }
          `}
        >
          <p className="text-lg uppercase tracking-widest text-zinc-400">
            Step {current.id}
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            {current.heading}
          </h2>

          <p
            className={`mt-5 max-w-4xl text-2xl leading-10

            ${
              darkMode
                ? "text-zinc-300"
                : "text-zinc-600"
            }
            `}
          >
            {current.description}
          </p>

          {/* VISUALIZATION */}

          <div
            className={`mt-12 rounded-3xl p-10

            ${
              darkMode
                ? "bg-zinc-950"
                : "bg-zinc-50"
            }
            `}
          >
            {activeStep === 1 && (
              <div className="text-3xl leading-[60px]">
                {text}
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-wrap gap-3">
                {phonemes.map((p, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-blue-500 px-5 py-4 text-2xl text-white"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex items-end gap-2">
                {Array.from({
                  length: 40,
                }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-t-xl bg-gradient-to-t from-blue-900 to-blue-200 animate-pulse"
                    style={{
                      width: "18px",
                      height: `${
                        50 +
                        Math.random() * 160
                      }px`,
                    }}
                  />
                ))}
              </div>
            )}

            {activeStep === 4 && (
              <svg
                viewBox="0 0 1200 200"
                className="w-full"
                fill="none"
              >
                <path
                  d="
                  M0 100
                  Q20 150 40 100
                  T80 100
                  T120 100
                  T160 100
                  T200 100
                  T240 100
                  T280 100
                  T320 100
                  T360 100
                  T400 100
                  T440 100
                  T480 100
                  T520 100
                  T560 100
                  T600 100
                  T640 100
                  T680 100
                  T720 100
                  T760 100
                  T800 100
                  T840 100
                  T880 100
                  T920 100
                  T960 100
                  T1000 100
                  T1040 100
                  T1080 100
                  T1120 100
                  T1160 100
                  T1200 100
                  "
                  stroke="#3b82f6"
                  strokeWidth="5"
                  className="animate-pulse"
                />
              </svg>
            )}

            {activeStep === 5 && (
              <div className="flex flex-col items-center justify-center">
                <Volume2 className="h-24 w-24 text-blue-500" />

                <h3 className="mt-6 text-4xl font-bold">
                  Audio playback
                </h3>

                <p className="mt-5 text-2xl text-zinc-500">
                  {isSpeaking
                    ? "Speaking..."
                    : "Ready"}
                </p>

                {isSpeaking && (
                  <div className="mt-10 flex items-end gap-1">
                    {visualizerData.map(
                      (h, i) => (
                        <div
                          key={i}
                          className="rounded-full bg-blue-500"
                          style={{
                            width: "8px",
                            height: `${h}px`,
                          }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* CONTROLS */}

<div
  className={`mt-8 rounded-3xl border p-8

  ${
    darkMode
      ? "border-zinc-800 bg-zinc-900"
      : "border-zinc-300 bg-white"
  }
  `}
>
  {/* PRESETS */}

  <div className="mb-8 flex flex-wrap gap-3">
    {presets.map((preset, i) => (
      <button
        key={i}
        onClick={() => setText(preset)}
        className="rounded-full border border-zinc-500 px-5 py-2"
      >
        {preset.slice(0, 22)}...
      </button>
    ))}
  </div>

  {/* TEXTAREA */}

  <textarea
    value={text}
    onChange={(e) =>
      setText(e.target.value)
    }
    className={`h-[160px] w-full rounded-3xl border p-6 text-3xl outline-none

    ${
      darkMode
        ? "border-zinc-700 bg-zinc-950"
        : "border-zinc-300 bg-zinc-50"
    }
    `}
  />

  {/* VOICE */}

  <div className="mt-6">
    <label className="mb-3 block text-xl text-zinc-500">
      Voice / Language
    </label>

    <select
  value={selectedVoice}
  onChange={(e) =>
    setSelectedVoice(
      e.target.value
    )
  }
  className={`w-full rounded-2xl border p-4 text-xl

  ${
    darkMode
      ? "border-zinc-700 bg-zinc-950"
      : "border-zinc-300 bg-white"
  }
  `}
>
  {Object.entries(
    voices.reduce((acc, voice) => {
      const lang =
        voice.lang || "Other";

      if (!acc[lang]) {
        acc[lang] = [];
      }

      acc[lang].push(voice);

      return acc;
    }, {} as Record<
      string,
      SpeechSynthesisVoice[]
    >)
  ).map(([lang, group]) => (
    <optgroup
      key={lang}
      label={lang}
    >
      {group.map((voice, index) => (
        <option
          key={index}
          value={voice.name}
        >
          {voice.name.replace(
            "Microsoft ",
            ""
          )}
        </option>
      ))}
    </optgroup>
  ))}
</select>
  </div>

  {/* SLIDERS */}

  <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
    <div>
      <div className="mb-3 text-lg text-zinc-500">
        Rate: {rate.toFixed(1)}x
      </div>

      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={rate}
        onChange={(e) =>
          setRate(
            Number(e.target.value)
          )
        }
        className="w-full"
      />
    </div>

    <div>
      <div className="mb-3 text-lg text-zinc-500">
        Pitch: {pitch.toFixed(1)}
      </div>

      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={pitch}
        onChange={(e) =>
          setPitch(
            Number(e.target.value)
          )
        }
        className="w-full"
      />
    </div>

    <div>
      <div className="mb-3 text-lg text-zinc-500">
        Pipeline Speed:{" "}
        {pipelineSpeed.toFixed(1)}x
      </div>

      <input
        type="range"
        min="0.5"
        max="3"
        step="0.1"
        value={pipelineSpeed}
        onChange={(e) =>
          setPipelineSpeed(
            Number(e.target.value)
          )
        }
        className="w-full"
      />
    </div>
  </div>

  {/* BUTTONS */}

  <div className="mt-10 flex flex-wrap items-center gap-4">
    <button
      onClick={prevStep}
      disabled={autoPlaying}
      className="flex items-center gap-3 rounded-2xl border border-zinc-500 px-8 py-4 text-2xl"
    >
      <ChevronLeft size={24} />

      Previous
    </button>

    <button
      onClick={nextStep}
      disabled={autoPlaying}
      className="flex items-center gap-3 rounded-2xl bg-black px-8 py-4 text-2xl font-semibold text-white"
    >
      <ChevronRight size={24} />

      Next step
    </button>

    <button
      onClick={speakAudio}
      disabled={autoPlaying}
      className="flex items-center gap-3 rounded-2xl bg-blue-500 px-8 py-4 text-2xl font-semibold text-white"
    >
      <Play size={24} />

      Speak
    </button>

    <button
      onClick={speakNow}
      className="flex items-center gap-3 rounded-2xl bg-green-600 px-8 py-4 text-2xl font-semibold text-white"
    >
      <Zap size={24} />

      Speak now
    </button>


    <button
      onClick={stopSpeaking}
      className="flex items-center gap-3 rounded-2xl border border-zinc-500 px-8 py-4 text-2xl"
    >
      <Square size={22} />

      Stop
    </button>

    <button
      onClick={resetAll}
      className="flex items-center gap-3 rounded-2xl border border-zinc-500 px-8 py-4 text-2xl"
    >
      <RotateCcw size={22} />

      Reset
    </button>
  </div>
</div>

{/* INFO */}

<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
  <div
    className={`rounded-3xl border p-6

    ${
      darkMode
        ? "border-zinc-800 bg-zinc-900"
        : "border-zinc-300 bg-white"
    }
    `}
  >
    <p className="text-lg text-zinc-400">
      Current voice
    </p>

    <h3 className="mt-3 text-2xl font-semibold">
      {selectedVoice}
    </h3>
  </div>

  <div
    className={`rounded-3xl border p-6

    ${
      darkMode
        ? "border-zinc-800 bg-zinc-900"
        : "border-zinc-300 bg-white"
    }
    `}
  >
    <p className="text-lg text-zinc-400">
      Detected language
    </p>

    <h3 className="mt-3 text-2xl font-semibold">
      {detectedLanguage}
    </h3>
  </div>

  <div
    className={`rounded-3xl border p-6

    ${
      darkMode
        ? "border-zinc-800 bg-zinc-900"
        : "border-zinc-300 bg-white"
    }
    `}
  >
    <p className="text-lg text-zinc-400">
      Inference latency
    </p>

    <h3 className="mt-3 text-2xl font-semibold">
      {latency} ms
    </h3>
  </div>

  <div
    className={`rounded-3xl border p-6

    ${
      darkMode
        ? "border-zinc-800 bg-zinc-900"
        : "border-zinc-300 bg-white"
    }
    `}
  >
    <p className="text-lg text-zinc-400">
      Selected Model
    </p>

    <h3 className="mt-3 text-2xl font-semibold">
      {selectedModel.name}
    </h3>

    <p className="mt-3 text-zinc-500">
      {selectedModel.type}
    </p>
  </div>
</div>
      </div>
    </div>
  );
}