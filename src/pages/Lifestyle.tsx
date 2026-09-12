import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

interface Section {
  id: string;
  emoji: string;
  title: string;
  intro: string;
  points: string[];
}

const SECTIONS: Section[] = [
  {
    id: "food",
    emoji: "🍽️",
    title: "Food & Nutrition",
    intro: "General habits many people find helpful — not a treatment plan.",
    points: [
      "Build meals around vegetables, whole grains, pulses and a protein source.",
      "Iodine, iron, selenium and zinc all play a part in normal thyroid function; most people get them from a varied diet rather than supplements.",
      "If you take thyroid medication, timing relative to food, coffee, calcium and iron can matter — ask your doctor or pharmacist what applies to you.",
      "Aim for regular hydration through the day rather than large amounts at once.",
      "Simple meal ideas: overnight oats with fruit, lentil soup with wholegrain bread, rice with dal and a vegetable side, yoghurt with nuts and seeds.",
    ],
  },
  {
    id: "sleep",
    emoji: "😴",
    title: "Sleep",
    intro: "Consistency usually helps more than total hours on any single night.",
    points: [
      "Try to go to bed and wake at similar times, including weekends.",
      "Wind down for 30 minutes before bed — dim lights, screens away, something calm.",
      "Keep the room cool, dark and quiet where you can.",
      "Note your sleep in the health tracker so you can see patterns over weeks, not days.",
      "Ongoing tiredness despite decent sleep is worth mentioning to your doctor.",
    ],
  },
  {
    id: "movement",
    emoji: "🚶",
    title: "Movement",
    intro: "Gentle and regular beats intense and occasional.",
    points: [
      "A daily walk is a solid starting point — even 10 minutes counts.",
      "Add light strength work a couple of times a week if it feels comfortable.",
      "Stretching or yoga can help with stiffness and stress.",
      "Rest when you need to; energy can vary while thyroid levels settle.",
      "Check with your clinician before starting anything strenuous.",
    ],
  },
  {
    id: "stress",
    emoji: "🧘",
    title: "Stress & Wellbeing",
    intro: "Stress management supports how you feel day to day.",
    points: [
      "Slow breathing for a few minutes can steady a stressful moment.",
      "Short mindfulness or meditation sessions are easier to keep up than long ones.",
      "Time outdoors, music, and contact with people you trust all help.",
      "Write down how you're feeling — it makes doctor conversations easier.",
      "If low mood or anxiety persists, please speak to a health professional.",
    ],
  },
  {
    id: "understand",
    emoji: "📚",
    title: "Understanding Your Thyroid",
    intro: "Plain explanations of the terms you'll see on your reports.",
    points: [
      "TSH: a signal from the pituitary gland telling the thyroid how much hormone to make. It often moves first when something changes.",
      "T4 (and Free T4): the main hormone the thyroid releases; the body converts much of it into T3.",
      "T3 (and Free T3): the more active hormone, involved in energy use across the body.",
      "Anti-TPO antibodies: can indicate an autoimmune process such as Hashimoto's. Your doctor interprets this alongside everything else.",
      "Reference ranges differ between laboratories, so always read your result against the range printed on your own report.",
    ],
  },
];

const QUESTIONS = [
  "What do my latest thyroid results mean for me?",
  "Should I repeat my tests, and when?",
  "Is my current medication dose still right?",
  "Could the symptoms I've noticed be thyroid-related?",
  "Are there foods or supplements I should time differently?",
];

const Lifestyle = () => {
  const [open, setOpen] = useState<string | null>(SECTIONS[0].id);

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden pb-24 md:pb-16">
      <Navigation />
      <div className="absolute top-24 -left-16 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />

      <main className="relative z-10 pt-24 px-4 md:px-6 max-w-3xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Diet & Lifestyle
          </h1>
          <p className="text-white/70 mt-2">
            Everyday habits that may support your wellbeing while you look after your thyroid.
          </p>
        </header>

        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-pink-400/25 backdrop-blur-sm">
          <CardContent className="p-5 text-white/75 text-sm leading-relaxed">
            These habits may support overall wellbeing. Your individual needs can vary, so discuss
            significant dietary or treatment changes with your clinician.
          </CardContent>
        </Card>

        <div className="space-y-3">
          {SECTIONS.map((s) => {
            const expanded = open === s.id;
            return (
              <Card
                key={s.id}
                className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : s.id)}
                  aria-expanded={expanded}
                  className="w-full text-left px-6 py-5 flex items-center gap-3 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  <span aria-hidden className="text-2xl">{s.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-lg font-semibold text-white">{s.title}</span>
                    <span className="block text-white/55 text-sm">{s.intro}</span>
                  </span>
                  <span className="text-pink-300 text-xl" aria-hidden>
                    {expanded ? "−" : "+"}
                  </span>
                </button>
                {expanded && (
                  <CardContent className="px-6 pb-6 pt-0">
                    <ul className="space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-3 text-white/75 text-sm leading-relaxed">
                          <span className="text-pink-300 mt-0.5" aria-hidden>
                            🦋
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/40">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Questions you could ask your doctor</h2>
            <ul className="space-y-2">
              {QUESTIONS.map((q) => (
                <li key={q} className="text-white/75 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  {q}
                </li>
              ))}
            </ul>
            <p className="text-white/40 text-xs mt-5">
              Educational support only — always confirm decisions with your doctor.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Lifestyle;
